from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model,login
from .serializers import UserRegisterSerializer,UserLoginSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
User = get_user_model()

class UserRegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

class UserLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self,request):
        serializer = UserLoginSerializer(
            data = request.data,
            context = {'request': request}
        )
        
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        login(request,user)
        
        return Response({
            'message': 'Login successful',
            'user_id': user.id,
            'phone_number': user.phone_number,
            'first_name': user.first_name,
            'last_name': user.last_name,
        })