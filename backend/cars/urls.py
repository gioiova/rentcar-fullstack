from django.urls import path
from .views import CarListView, CarDetailView,CarCreateView,CarImageCreateView

urlpatterns = [
    path('', CarListView.as_view(), name='car-list'),
    path('<int:pk>/', CarDetailView.as_view(), name='car-detail'),
    path('create/', CarCreateView.as_view(), name='car-create'),
    path('<int:pk>/images/', CarImageCreateView.as_view(), name='car-image-create')
    
]

