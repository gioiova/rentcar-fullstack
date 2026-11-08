from rest_framework.generics import CreateAPIView,RetrieveAPIView
from rest_framework.permissions import AllowAny,IsAuthenticated
from django.contrib.auth import get_user_model,login,logout
from .serializers import UserRegisterSerializer,UserLoginSerializer,UserProfileSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.middleware.csrf import get_token
User = get_user_model()

class UserRegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

class CSRFTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def get(self,request):
        return Response({'csrfToken':get_token(request)})
    
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

class UserLogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self,request):
        logout(request)
        return Response({
            'message':'Logout succesfull'   
        })

class UserProfileView(RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    