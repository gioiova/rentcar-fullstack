from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView,RetrieveAPIView,CreateAPIView,RetrieveUpdateAPIView,DestroyAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied,ValidationError
from rest_framework.parsers import MultiPartParser, FormParser 
from .models import Car,CarImage
from .serializers import CarSerializer,CarImageSerializer
from django_filters.rest_framework import DjangoFilterBackend
from .filters import CarFilter

class CarListView(ListAPIView):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CarFilter

class CarDetailView(RetrieveAPIView):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    
class CarCreateView(CreateAPIView):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class CarImageCreateView(CreateAPIView):
    queryset = CarImage.objects.all()
    serializer_class = CarImageSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self,serializer):
        car = get_object_or_404(Car, pk=self.kwargs['pk'])
        
        if car.owner != self.request.user:
            raise PermissionDenied("You can only upload images for your own cars.")
        
        if car.images.count() >= 3:
            raise ValidationError("You can only upload up to 3 images for a car.")
        
        image = serializer.validated_data['image']
        
        if image.content_type not in ['image/jpeg', 'image/png',   'image/jpg']:
            raise ValidationError("Only JPEG, PNG, and JPG images are allowed.")
        
        serializer.save(car=car)

class CarUpdateView(RetrieveUpdateAPIView):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [IsAuthenticated]

    
    def get_object(self):
        car = super().get_object()
        if car.owner != self.request.user:
            raise PermissionDenied("You can only update your own car.")
        
        return car

class CarDeleteView(DestroyAPIView):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        car = super().get_object()
        if car.owner != self.request.user:
            raise PermissionDenied("You can only delete your own car.")
        
        return car  

