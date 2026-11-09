from django.urls import path
from .views import CarListView, CarDetailView,CarCreateView,CarImageCreateView,CarUpdateView,CarDeleteView,FavoriteListView,FavoriteToggleView,RentalCreateView,MyRentalsView,CarBookedDatesView,CarImageDeleteView,RentalCancelView

urlpatterns = [
    path('', CarListView.as_view(), name='car-list'),
    path('<int:pk>/', CarDetailView.as_view(), name='car-detail'),
    path('create/', CarCreateView.as_view(), name='car-create'),
    path('<int:pk>/images/', CarImageCreateView.as_view(), name='car-image-create'),
    path('<int:pk>/update/', CarUpdateView.as_view(), name='car-update'),
    path('<int:pk>/delete/', CarDeleteView.as_view(), name='car-delete'),
    path('favorites/',FavoriteListView.as_view(),name='favorite-list'),
    path('<int:pk>/favorite/',FavoriteToggleView.as_view(),name='favorite-toggle'),
    path('rentals/',MyRentalsView.as_view(),name='my-rentals'),
    path('rentals/create/',RentalCreateView.as_view(),name ='rental-create'),
    path('<int:pk>/booked-dates/',CarBookedDatesView.as_view(),name='car-booked-dates'),
    path('<int:car_id>/images/<int:pk>/delete/',CarImageDeleteView.as_view(),name='car-image-delete'),
    path('rentals/<int:pk>/cancel/',RentalCancelView.as_view(),name='rental-cancel')
]

