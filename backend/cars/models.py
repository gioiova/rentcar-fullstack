from django.db import models
from django.conf import settings
# Create your models here.
class Car(models.Model):
    TRANSMISSION_CHOICES = [
        ('automatic', 'Automatic'),
        ('manual', 'Manual'),
        ('tiptronic', 'Tiptronic'),
    ]
    
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    capacity = models.PositiveIntegerField()
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES)
    city = models.CharField(max_length=100)
    fuel_tank_capacity = models.PositiveIntegerField()
    
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cars')

    created_at = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.brand} {self.model} ({self.year})"

class CarImage(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='cars/')
    
    def __str__(self):
        return f"Image for {self.car.brand} {self.car.model} ({self.car.year})"

class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites'
    )
    car  = models.ForeignKey(
        Car,
        on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    
    class Meta:
        unique_together =('user','car')
        
    def __str__(self):
        return f"{self.user} - {self.car}"

class Rental(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name= 'rentals'
    )
    
    car = models.ForeignKey(
        Car,
        on_delete= models.CASCADE,
        related_name='rentals'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    days = models.PositiveIntegerField()
    total_price = models.DecimalField(
        max_digits=20,
        decimal_places=2
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user} rented {self.car}"