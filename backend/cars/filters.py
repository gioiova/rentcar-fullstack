import django_filters
from .models import Car

class CarFilter(django_filters.FilterSet):
    year_min = django_filters.NumberFilter(field_name='year', lookup_expr='gte')
    year_max = django_filters.NumberFilter(field_name='year', lookup_expr='lte')
    
    class Meta:
        model  = Car
        fields = ['city','capacity','year_min','year_max']