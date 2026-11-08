from rest_framework import serializers
from .models import Car,CarImage,Favorite,Rental
from django.utils import timezone
from PIL import Image

class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image']
    
    def validate_image(self,value):
        try:
            image = Image.open(value)
            image.verify()
        except Exception:
            raise serializers.ValidationError('invalid image file.')
        finally:
            value.seek(0)
        
        if image.format not in ['JPG','JPEG','PNG']:
            raise serializers.ValidationError("Only JPG,JPEG and PNG   are allowed")
        
        return value
    

class CarSerializer(serializers.ModelSerializer):
    images = CarImageSerializer(many=True, read_only=True)

    class Meta:
        model = Car
        fields = '__all__'
        read_only_fields = ['owner', 'created_at']
    
class FavoriteSerializer(serializers.ModelSerializer):
    car = CarSerializer(read_only = True)
    
    class Meta:
        model = Favorite
        fields = ['id','car']

class RentalSerializer(serializers.ModelSerializer):
    car_details = CarSerializer(source = 'car',read_only = True)
    
    class Meta:
        model = Rental
        fields = ['id','car','car_details','start_date','end_date','days','total_price','created_at']
        read_only_fields = ['total_price','created_at','days']
        
        
        def validate(self,attrs):
            start_date = attrs['start_date']
            end_date = attrs['end_date']
            
            if start_date < timezone.localdate():
                raise serializers.ValidationError('Start date cannot be in the past.')
            
            if end_date <= start_date:
                raise serializers.ValidationError('End date must be after start date.')
            
            return attrs
    
class BookedDatesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rental
        fields = ['start_date','end_date']