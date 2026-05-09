import os
import yaml
from typing import Dict, Optional
from loguru import logger

class PromptManager:
    def __init__(self, prompts_dir: str = "app/prompts"):
        self.prompts_dir = prompts_dir
        self.prompts_cache: Dict[str, Dict] = {}
        self._load_all_prompts()

    def _load_all_prompts(self):
        if not os.path.exists(self.prompts_dir):
            os.makedirs(self.prompts_dir)
            return

        for filename in os.listdir(self.prompts_dir):
            if filename.endswith(".yaml") or filename.endswith(".yml"):
                name = os.path.splitext(filename)[0]
                with open(os.path.join(self.prompts_dir, filename), "r") as f:
                    try:
                        self.prompts_cache[name] = yaml.safe_load(f)
                        logger.info(f"Loaded prompt template: {name}")
                    except Exception as e:
                        logger.error(f"Failed to load prompt {filename}: {str(e)}")

    def get_prompt(self, name: str, version: str = "latest") -> Optional[str]:
        prompt_data = self.prompts_cache.get(name)
        if not prompt_data:
            return None
        
        versions = prompt_data.get("versions", {})
        if version == "latest":
            # Assume the last version is latest or there is a 'latest' key
            latest_version = prompt_data.get("latest_version")
            return versions.get(latest_version)
        
        return versions.get(version)

    def get_ab_test_prompt(self, name: str, user_id: str) -> str:
        """
        Simple deterministic A/B testing based on user_id hash.
        """
        prompt_data = self.prompts_cache.get(name)
        if not prompt_data or "ab_test" not in prompt_data:
            return self.get_prompt(name)

        test_config = prompt_data["ab_test"]
        variants = test_config["variants"]
        
        # Deterministic variant selection
        variant_idx = hash(user_id) % len(variants)
        selected_version = variants[variant_idx]
        
        logger.info(f"A/B Test [{name}]: User {user_id} assigned to variant {selected_version}")
        return self.get_prompt(name, selected_version)

prompt_manager = PromptManager()
