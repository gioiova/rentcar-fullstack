import re
from rest_framework import  serializers
from django.contrib.auth import get_user_model,authenticate
from cars.serializers import CarSerializer,FavoriteSerializer,RentalSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone_number','email', 'password']
        extra_kwargs = {'password':{'write_only':True}}
        
    
    def validate_phone_number(self,value):
        if not re.fullmatch(r'5\d{8}',value):
            raise serializers.ValidationError('phone number must contains 9 digit and start with 5')
        
        return value
    
    def validate_email(self,value):
        return value.lower()
    
    def validate_password(self,value):
        try:
            validate_password(value)
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages)
        
        return value
    
    def create(self,validated_data):
        phone_number = validated_data['phone_number']
        
        user = User.objects.create_user(
            username = phone_number,
            **validated_data
        )
        
        return user

class UserLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only = True)
    
    def validate(self,attrs):
        phone_number = attrs.get("phone_number")
        password = attrs.get("password")
        
        user = authenticate(
            request = self.context.get('request'),
            username = phone_number,
            password = password
        )
        
        
        if user is None:
            raise serializers.ValidationError("Invalid phone number or password")
        
        attrs['user'] = user
        return attrs

class UserProfileSerializer(serializers.ModelSerializer):
    cars = CarSerializer(many=True,read_only=True)
    favorites = FavoriteSerializer(many=True,read_only=True)
    rentals = RentalSerializer(many = True,read_only = True)
    class Meta:
        model = User
        fields = ['id','first_name','last_name','phone_number','email','cars','favorites','rentals']
        