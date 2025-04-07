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