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

class Game(models.Model):
    player_id = models.CharField(max_length=100)
    score = models.IntegerField(default=0)
    time_remaining = models.IntegerField(default=60)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-score', '-created_at']

class GameFoodResources(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    image = models.URLField(max_length=255)
    description = models.TextField()

    class Meta:
        db_table = 'game_foodresources'  # Specify the actual table name
        managed = False  # Since the table already exists

    def __str__(self):
        return f"{self.name} - {self.type}"

class SecondLife(models.Model):
    method_id = models.IntegerField(primary_key=True)
    method_name = models.CharField(max_length=100)
    is_combo = models.CharField(max_length=10)
    method_category = models.CharField(max_length=50)
    ingredient = models.CharField(max_length=100)
    description = models.CharField(max_length=1000)
    picture = models.CharField(max_length=255)

    class Meta:
        db_table = 'diy_products'
        managed = False 

    def __str__(self):
        return f"{self.method_name} - {self.ingredient}"
    
class FoodIngredient(models.Model):
    id = models.AutoField(primary_key=True)
    dish = models.CharField(max_length=255)
    ingredient = models.TextField()
    
    class Meta:
        db_table = 'food_ingredients'
        managed = True
    
    def __str__(self):
        return f"{self.dish}"

class Dish(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=128)
    cuisine = models.CharField(max_length=50)
    URL = models.CharField(max_length=128)

    class Meta:
        db_table = 'meal_data'  
        managed = False  

    def __str__(self):
        return self.name
    

class FoodWasteComposition(models.Model):
    type = models.CharField(max_length=100)  # Food waste category
    quantity = models.FloatField()  # Quantity in tonnes
    
    class Meta:
        db_table = 'food_waste_composition'
        managed = False  
    
    def __str__(self):
        return f"{self.type} - {self.quantity} tonnes"
    