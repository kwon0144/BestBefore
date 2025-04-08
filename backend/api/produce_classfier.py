class ProduceClassifier:
    """
    A class for classifying produce items and providing storage recommendations.
    This will be extended to connect with a database in the future.
    """
    
    # Default storage recommendations for common produce items
    STORAGE_RECOMMENDATIONS = {
        # Fruits
        "apple": "refrigerator",
        "banana": "pantry",
        "orange": "refrigerator",
        "lemon": "refrigerator",
        "lime": "refrigerator",
        "avocado": "pantry",  # until ripe, then refrigerator
        "strawberry": "refrigerator",
        "blueberry": "refrigerator",
        "raspberry": "refrigerator",
        "blackberry": "refrigerator",
        "grape": "refrigerator",
        "watermelon": "pantry",  # until cut, then refrigerator
        "cantaloupe": "pantry",  # until cut, then refrigerator
        "pineapple": "pantry",  # until cut, then refrigerator
        "peach": "pantry",  # until ripe, then refrigerator
        "pear": "pantry",  # until ripe, then refrigerator
        "plum": "pantry",  # until ripe, then refrigerator
        "kiwi": "pantry",  # until ripe, then refrigerator
        "mango": "pantry",  # until ripe, then refrigerator
        
        # Vegetables
        "potato": "pantry",
        "sweet potato": "pantry",
        "onion": "pantry",
        "garlic": "pantry",
        "tomato": "pantry",  # until ripe, then refrigerator
        "cucumber": "refrigerator",
        "carrot": "refrigerator",
        "bell pepper": "refrigerator",
        "broccoli": "refrigerator",
        "cauliflower": "refrigerator",
        "lettuce": "refrigerator",
        "spinach": "refrigerator",
        "kale": "refrigerator",
        "cabbage": "refrigerator",
        "celery": "refrigerator",
        "corn": "refrigerator",
        "green bean": "refrigerator",
        "pea": "refrigerator",
        "asparagus": "refrigerator",
        "zucchini": "refrigerator",
        "eggplant": "refrigerator",
        
        # Others
        "bread": "pantry",
        "pasta": "pantry",
        "rice": "pantry",
        "cereal": "pantry",
        "flour": "pantry",
        "sugar": "pantry",
        "egg": "refrigerator",
        "milk": "refrigerator",
        "cheese": "refrigerator",
        "yogurt": "refrigerator",
        "butter": "refrigerator",
        "meat": "refrigerator",
        "chicken": "refrigerator",
        "fish": "refrigerator",
        "tofu": "refrigerator",
        "mushroom": "refrigerator",
    }
    
    @classmethod
    def get_storage_recommendation(cls, produce_item):
        """
        Determines whether a produce item should be stored in the pantry or refrigerator.
        
        Args:
            produce_item (str): The name of the produce item.
            
        Returns:
            str: "pantry" or "refrigerator"
        """
        # Convert to lowercase for matching
        item_lower = produce_item.lower()
        
        # Check if we have a recommendation for this item
        if item_lower in cls.STORAGE_RECOMMENDATIONS:
            return cls.STORAGE_RECOMMENDATIONS[item_lower]
        
        # Default to refrigerator for unknown items as a safer option
        # This helps reduce food waste by ensuring proper storage
        return "refrigerator"
    
    @classmethod
    def enrich_detection_results(cls, produce_counts):
        """
        Enriches the detection results with storage recommendations.
        
        Args:
            produce_counts (dict): Dictionary mapping produce items to quantities.
            
        Returns:
            dict: Enriched dictionary with storage recommendations.
        """
        enriched_results = {}
        
        for item, count in produce_counts.items():
            storage = cls.get_storage_recommendation(item)
            enriched_results[item] = {
                "count": count,
                "storage": storage
            }
            
        return enriched_results