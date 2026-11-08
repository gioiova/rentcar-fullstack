from rest_framework import serializers
from .models import Car,CarImage,Favorite,Rental

class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image']

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
        fields = ['id','car','car_details','days','total_price','created_at']
        read_only_fields = ['total_price','created_at']
        
        def validate_days(self,value):
            if value < 1:
                raise serializers.ValidationError(
                    "rental days must be at least 1."
                )
            
            return value