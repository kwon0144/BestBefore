from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import User, Temperature
from .serializer import UserSerializer, TemperatureSerializer
from rest_framework import viewsets

@api_view(['GET'])
def get_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_temperature_data(request):
    try:
        # Get all temperature records
        temperatures = Temperature.objects.all()
        # You can add filtering here if needed, for example:
        # temperatures = Temperature.objects.filter(timestamp__gte='2024-01-01')
        
        # Serialize the data
        serializer = TemperatureSerializer(temperatures, many=True)
        
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)