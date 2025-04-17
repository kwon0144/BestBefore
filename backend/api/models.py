from django.db import models

# Create your models here.
class User(models.Model):
    age = models.IntegerField()
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Temperature(models.Model):
    class Meta:
        db_table = 'temperature'  # This specifies the actual table name in the database
        managed = False  # Since the table already exists in the database
        unique_together = (('month', 'day'),)  # Composite primary key

    month = models.IntegerField(primary_key=True)  # Part of composite primary key
    day = models.IntegerField()  # Part of composite primary key
    temperature = models.FloatField()

    def __str__(self):
        return f"Temperature: {self.temperature} on month {self.month} day {self.day}"

class FoodStorage(models.Model):
    type = models.CharField(max_length=255, null=True, blank=True)
    storage_time = models.IntegerField(null=True, blank=True)
    method = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'food_storage'  # Specify the actual table name
        managed = False  # Since the table already exists, no need for Django to manage it

    def __str__(self):
        return f"{self.type} - {self.storage_time} days"

# geospatial model for map
class Geospatial(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    type = models.CharField(max_length=100)
    hours_of_operation = models.TextField()
    address = models.TextField()
    
    class Meta:
        db_table = 'geospatial'
        managed = False
    
    def __str__(self):
        return self.name

class Game(models.Model):
    player_id = models.CharField(max_length=100)
    score = models.IntegerField(default=0)
    time_remaining = models.IntegerField(default=60)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-score', '-created_at']

    