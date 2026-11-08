from django.urls import path
from .views import UserRegisterView,UserLoginView,UserLogoutView,UserProfileView,CSRFTokenView

urlpatterns = [
    path('register/',UserRegisterView.as_view(),name='user-register'),
    path('login/',UserLoginView.as_view(),name='user-login'),
    path('csrf/',CSRFTokenView.as_view(),name='csrf-token'),
    path('logout/',UserLogoutView.as_view(),name='user-logout'),
    path('profile/',UserProfileView.as_view(),name='user-profile'),
]