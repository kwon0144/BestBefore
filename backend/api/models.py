from django.db import models

# Create your models here.
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

class SecondLife(models.Model):
    id = models.IntegerField(primary_key=True)
    items = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    method = models.CharField(max_length=255)
    label = models.CharField(max_length=255)
    description = models.TextField()  
    picture = models.URLField(max_length=255)
    inside_picture = models.URLField(max_length=255)

    class Meta:
        db_table = 'diy_projects'  
        managed = False  

    def __str__(self):
        return f"{self.items} - {self.method}"
    
class FoodIngredient(models.Model):
    id = models.AutoField(primary_key=True)
    dish = models.CharField(max_length=255)
    ingredient = models.TextField()
    
    class Meta:
        db_table = 'food_ingredients'
        managed = True
    
    def __str__(self):
        return f"{self.dish}"