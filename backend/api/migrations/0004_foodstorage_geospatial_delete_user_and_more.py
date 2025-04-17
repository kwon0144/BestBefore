# Generated by Django 5.2 on 2025-04-17 16:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_temperature"),
    ]

    operations = [
        migrations.CreateModel(
            name="FoodStorage",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("type", models.CharField(blank=True, max_length=255, null=True)),
                ("storage_time", models.IntegerField(blank=True, null=True)),
                ("method", models.IntegerField(blank=True, null=True)),
            ],
            options={
                "db_table": "food_storage",
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="Geospatial",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("latitude", models.FloatField()),
                ("longitude", models.FloatField()),
                ("type", models.CharField(max_length=100)),
                ("hours_of_operation", models.TextField()),
                ("address", models.TextField()),
            ],
            options={
                "db_table": "geospatial",
                "managed": False,
            },
        ),
        migrations.DeleteModel(
            name="User",
        ),
        migrations.DeleteModel(
            name="Temperature",
        ),
    ]
