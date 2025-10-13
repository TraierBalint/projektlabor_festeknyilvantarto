# Database Loader for Paint Inventory Management System

A comprehensive database loading system that handles all data types in the paint inventory management system including users, products, colors, mixes, carts, orders, and inventory.

## Features

- **Universal Data Loading**: Supports all entity types in the system
- **Multiple Formats**: Load from JSON, CSV, or Python dictionaries
- **Batch Processing**: Efficient processing of large datasets
- **Data Validation**: Built-in validation with custom rule support
- **Data Transformation**: Normalize and transform data during loading
- **Relationship Handling**: Load related entities in correct dependency order
- **Export Capabilities**: Export database data to JSON or CSV
- **Error Handling**: Comprehensive error handling and logging
- **Sample Data Generation**: Generate sample data for testing

## Installation

First, install the required dependencies:

```bash
pip install -r requirements.txt
```

The following packages were added for data loading:

- `pandas==2.2.3` - For CSV processing and data manipulation
- `faker==30.8.2` - For generating sample data

## Quick Start

### 1. Basic Usage

```python
from app.data_loader import DatabaseLoader, load_from_file, load_data

# Load data from a file
success = load_from_file("users.json", "users")

# Load data from a list of dictionaries
user_data = [
    {"name": "John Doe", "email": "john@example.com", "password": "password123"}
]
success = load_data("users", user_data)
```

### 2. Using the DatabaseLoader Class

```python
from app.data_loader import DatabaseLoader

with DatabaseLoader() as loader:
    # Load from file
    loader.load_data_from_file("products.csv", "products")

    # Load from data
    color_data = [
        {"name": "Red", "hex_code": "#FF0000", "available": True}
    ]
    loader.load_entity_data("colors", color_data)

    # Validate data without loading
    results = loader.validate_data("users", user_data)
    print(results)
```

### 3. Advanced Features

```python
from app.data_loader_utils import AdvancedDataLoader, DataTransformers, DataValidators

with AdvancedDataLoader() as loader:
    # Register transformations
    loader.register_transformation('users', DataTransformers.normalize_email)
    loader.register_validation_rule('users', DataValidators.validate_user)

    # Load with custom rules
    loader.load_entity_data_with_transform('users', user_data)

    # Batch load multiple related entities
    data_files = {
        'users': 'users.json',
        'products': 'products.csv',
        'colors': 'colors.json'
    }
    loader.load_with_relationships(data_files)
```

## Supported Entity Types

The loader supports all entity types in the paint inventory system:

- **users** - User accounts and authentication
- **products** - Paint products and supplies
- **colors** - Available paint colors
- **mixes** - Custom color mixes created by users
- **mix_components** - Components that make up color mixes
- **carts** - Shopping carts
- **cart_items** - Items in shopping carts
- **orders** - Purchase orders
- **order_items** - Items in orders
- **inventory** - Inventory tracking

## Data Format Examples

### Users (JSON)

```json
[
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "address": "123 Main St, City, State",
    "role": "user"
  }
]
```

### Products (CSV)

```csv
name,description,category,price,stock_quantity,unit
"Premium White Paint","High-quality white paint","Paint",35.99,45,"liter"
"Paint Brush Set","Professional brush set","Brush",15.75,100,"piece"
```

### Colors (JSON)

```json
[
  {
    "name": "Crimson Red",
    "hex_code": "#DC143C",
    "rgb_code": "rgb(220, 20, 60)",
    "available": true
  }
]
```

## Command Line Tools

### Quick Loader

Use the quick loader for common operations:

```bash
# Load sample data
python data_loading_examples/quick_loader.py --action sample --users 10 --products 20

# Show database statistics
python data_loading_examples/quick_loader.py --action stats

# Export data
python data_loading_examples/quick_loader.py --action export --output exports --format json

# Clear all data
python data_loading_examples/quick_loader.py --action clear
```

### Full Examples

Run comprehensive examples:

```bash
python data_loading_examples/example_usage.py
```

This will demonstrate:

- Loading generated sample data
- Loading from files
- Advanced loading with transformations
- Batch loading with relationships
- Data export
- Data validation

## Data Loading Process

### 1. Dependency Order

Entities are loaded in dependency order to maintain referential integrity:

1. `users` - Independent entity
2. `products` - Independent entity
3. `colors` - Independent entity
4. `mixes` - Depends on users
5. `mix_components` - Depends on mixes and colors
6. `carts` - Depends on users
7. `cart_items` - Depends on carts and products
8. `orders` - Depends on users
9. `order_items` - Depends on orders and products
10. `inventory` - Depends on products

### 2. Validation Rules

Each entity type has built-in validation:

- **Users**: Required name, email, password; email format validation; password length check
- **Products**: Required name and price; positive price validation
- **Colors**: Required name
- **Mixes**: Required user_id and name
- **Mix Components**: Required mix_id, color_id, and ratio
- **Cart Items**: Required cart_id, product_id, and quantity
- **Order Items**: Required order_id, product_id, quantity, and unit_price
- **Inventory**: Required product_id

### 3. Data Transformations

Built-in transformations include:

- **Email Normalization**: Convert emails to lowercase
- **Price Formatting**: Ensure prices are properly formatted decimals
- **Phone Normalization**: Remove non-digit characters from phone numbers

## Error Handling

The loader provides comprehensive error handling:

- **File Errors**: Missing files, invalid formats
- **Data Errors**: Missing required fields, invalid data types
- **Database Errors**: Constraint violations, connection issues
- **Validation Errors**: Custom validation failures

All errors are logged with detailed information for debugging.

## Sample Data Generation

Generate sample data for testing:

```python
from app.data_loader_utils import load_with_sample_data

# Generate and load sample data
success = load_with_sample_data(
    num_users=10,
    num_products=20,
    num_colors=15
)
```

This creates realistic sample data using the Faker library.

## Export Functionality

Export your database to files:

```python
from app.data_loader_utils import export_database

# Export as JSON
export_database("exports", format='json')

# Export as CSV
export_database("exports_csv", format='csv')
```

## Best Practices

1. **Always validate data first** before loading to production
2. **Use batch processing** for large datasets
3. **Load entities in dependency order** to avoid foreign key constraints
4. **Backup your database** before bulk operations
5. **Use transactions** to ensure data consistency
6. **Monitor logs** for errors and warnings
7. **Test with sample data** before loading real data

## API Reference

### DatabaseLoader

Main class for database loading operations.

#### Methods

- `load_data_from_file(file_path, entity_type, **kwargs)` - Load from file
- `load_entity_data(entity_type, data, batch_size=100, validate_only=False)` - Load entity data
- `validate_data(entity_type, data)` - Validate without loading
- `clear_all_data()` - Clear all database data

### AdvancedDataLoader

Extended loader with advanced features.

#### Additional Methods

- `load_with_relationships(data_files, dependency_order=None)` - Batch load with dependencies
- `export_data_to_files(output_dir, entity_types=None, format='json')` - Export data
- `create_sample_data(num_users=10, num_products=20, num_colors=15)` - Generate sample data
- `get_database_statistics()` - Get record counts
- `register_transformation(entity_type, transformer)` - Register data transformer
- `register_validation_rule(entity_type, validator)` - Register custom validator

### Utility Functions

- `load_from_file(file_path, entity_type, **kwargs)` - Convenience function for file loading
- `load_data(entity_type, data, **kwargs)` - Convenience function for data loading
- `validate_data(entity_type, data)` - Convenience function for validation
- `load_with_sample_data(num_users, num_products, num_colors)` - Load sample data
- `export_database(output_dir, format='json')` - Export entire database
- `get_stats()` - Get database statistics

## Troubleshooting

### Common Issues

1. **Foreign Key Constraints**: Ensure dependent entities are loaded after their dependencies
2. **Duplicate Keys**: Check for unique constraint violations (emails, etc.)
3. **Invalid Data Types**: Ensure numeric fields contain valid numbers
4. **Missing Required Fields**: Validate all required fields are present
5. **File Encoding Issues**: Use UTF-8 encoding for text files

### Debugging

Enable detailed logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

Use validation mode to check data without loading:

```python
with DatabaseLoader() as loader:
    results = loader.validate_data('users', user_data)
    print(f"Valid: {results['valid_records']}, Invalid: {results['invalid_records']}")
    if results['errors']:
        print("Errors:", results['errors'])
```

## Contributing

To extend the data loader:

1. Add new entity support to `_load_*` methods in `DatabaseLoader`
2. Create transformation functions in `DataTransformers`
3. Add validation rules in `DataValidators`
4. Update the dependency order if needed
5. Add examples and tests

## License

This database loader is part of the Paint Inventory Management System project.
