from rest_framework import  serializers
from django.contrib.auth import get_user_model,authenticate

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone_number','email', 'password']
        extra_kwargs = {'password':{'write_only':True}}
        
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