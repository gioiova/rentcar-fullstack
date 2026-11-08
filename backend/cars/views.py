from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView,RetrieveAPIView,CreateAPIView,RetrieveUpdateAPIView,DestroyAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied,ValidationError
from rest_framework.parsers import MultiPartParser, FormParser 
from .models import Car,CarImage,Favorite,Rental
from .serializers import CarSerializer,CarImageSerializer,FavoriteSerializer,RentalSerializer,BookedDatesSerializer
from django_filters.rest_framework import DjangoFilterBackend
from .filters import CarFilter
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework import status
from rest_framework.response import Response
from django.utils import timezone

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
    
    @transaction.atomic
    def perform_create(self,serializer):
        car = Car.objects.select_for_update().get(
            pk = serializer.validated_data['car'].pk
        )
        
        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']
        
        if car.owner == self.request.user:
            raise ValidationError("You cannot rent you own car")
        
        is_booked = Rental.objects.filter(
            car=car,
            start_date__lt = end_date,
            end_date__gt = start_date
        ).exists()
        
        if is_booked:
            raise  ValidationError(
                'This car is already booked for these dates '
            )
        days = (end_date - start_date).days
        total_price = car.price_per_day * days
        
        serializer.save(
            user = self.request.user,
            days = days,
            total_price = total_price,
            
        )

class MyRentalsView(ListAPIView):
    serializer_class = RentalSerializer
    permission_classes  = [IsAuthenticated]
    
    def get_queryset(self):
        return Rental.objects.filter(
            user = self.request.user
        ).order_by('-created_at')
    
    
class CarBookedDatesView(ListAPIView):
    serializer_class = BookedDatesSerializer
    
    
    def get_queryset(self):
        car = get_object_or_404(Car,pk=self.kwargs['pk'])
        
        return Rental.objects.filter(
            car=car,
            end_date__gte=timezone.localdate()
        ).order_by('start_date')