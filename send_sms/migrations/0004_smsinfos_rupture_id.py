# Generated by Django 4.2.9 on 2024-01-19 14:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('send_sms', '0003_smsinfos_unchanged_devices'),
    ]

    operations = [
        migrations.AddField(
            model_name='smsinfos',
            name='rupture_id',
            field=models.TextField(null=True),
        ),
    ]
