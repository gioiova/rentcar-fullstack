from rest_framework import serializers
from .models import Car,CarImage,Favorite

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
        