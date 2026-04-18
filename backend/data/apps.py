from django.apps import AppConfig
import joblib
import os
from django.conf import settings

import logging

logger = logging.getLogger(__name__)

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'data'
    
    # Stockage global pour les modèles ML
    model_classif = None
    model_reg = None

    def ready(self):
        logger.info("Initializing AI Engine...")
        try:
            # Construct absolute path using Django settings
            base_dir = settings.BASE_DIR
            models_dir = os.path.join(base_dir, 'models')
            
            cls_path = os.path.join(models_dir, 'model_classification.pkl')
            reg_path = os.path.join(models_dir, 'model_regression.pkl')

            # Debug logs as requested
            print(f"🔍 Loading classification model from: {cls_path}")
            print(f"🔍 Loading regression model from: {reg_path}")

            if os.path.exists(cls_path) and os.path.exists(reg_path):
                self.model_classif = joblib.load(cls_path)
                self.model_reg = joblib.load(reg_path)
                logger.info(f"Models loaded successfully from {models_dir}")
                print("✅ Models loaded successfully.")
            else:
                error_msg = f"Models not found in {models_dir}"
                logger.error(error_msg)
                print(f"❌ {error_msg}")
                # Print directory contents to help debugging on Render
                if os.path.exists(base_dir):
                    print(f"📂 Current Directory Content of {base_dir}: {os.listdir(base_dir)}")
                else:
                    print(f"❌ BASE_DIR {base_dir} does not exist!")

        except Exception as e:
            logger.error(f"Error loading AI models: {e}")
            print(f"❌ Critical Error loading AI models: {e}")
            # Ensure we print directory structure even on Exception
            try:
                print(f"📂 Current Directory Content of {settings.BASE_DIR}: {os.listdir(settings.BASE_DIR)}")
            except:
                pass