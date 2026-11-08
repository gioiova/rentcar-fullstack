from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView,RetrieveAPIView,CreateAPIView,RetrieveUpdateAPIView,DestroyAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied,ValidationError
from rest_framework.parsers import MultiPartParser, FormParser 
from .models import Car,CarImage,Favorite,Rental
from .serializers import CarSerializer,CarImageSerializer,FavoriteSerializer,RentalSerializer
from django_filters.rest_framework import DjangoFilterBackend
from .filters import CarFilter
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework import status
from rest_framework.response import Response

class CarListView(ListAPIView):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    filter_backends = [DjangoFilterBackend,SearchFilter,OrderingFilter,]
    filterset_class = CarFilter
    
    search_fields = ['brand','model']
    
    ordering_fields = ['price_per_day']
    

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

class FavoriteListView(ListAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Favorite.objects.filter(user = self.request.user)
    
class FavoriteToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        car = get_object_or_404(Car, pk=pk)

        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            car=car
        )

        if not created:
            favorite.delete()
            return Response({
                'message': 'Car removed from favorites'
            })

        return Response(
            {'message': 'Car added to favorites'},
            status=status.HTTP_201_CREATED
        )

class RentalCreateView(CreateAPIView):
    queryset = Rental.objects.all()
    serializer_class = RentalSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self,serializer):
        car = serializer.validated_data['car']
        days = serializer.validated_data['days']
        
        if car.owner == self.request.user:
            raise ValidationError("You cannot rent you own car")
        
        total_price = car.price_per_day * days
        
        serializer.save(
            user = self.request.user,
            total_price = total_price
            
        )

class MyRentalsView(ListAPIView):
    serializer_class = RentalSerializer
    permission_classes  = [IsAuthenticated]
    
    def get_queryset(self):
        return Rental.objects.filter(
            user = self.request.user
        ).order_by('-created_at')