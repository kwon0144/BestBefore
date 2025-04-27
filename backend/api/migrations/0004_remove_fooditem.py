# Generated manually

from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_temperature'),
    ]

    operations = [
        migrations.DeleteModel(
            name='FoodItem',
        ),
    ] 