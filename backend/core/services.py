"""
Base service classes for clean architecture implementation.
All business logic should be in service classes, not views.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Generic, List, Optional, TypeVar
from django.db import models

T = TypeVar('T', bound=models.Model)


class BaseService(ABC):
    """
    Abstract base service class.
    All services should inherit from this class.
    """
    
    @abstractmethod
    def execute(self, *args, **kwargs) -> Any:
        """Execute the service logic."""
        pass


class CRUDService(Generic[T]):
    """
    Generic CRUD service for database operations.
    Implements repository pattern for data access.
    """
    
    model_class: type[T] = None
    
    def __init__(self, model_class: type[T] = None):
        if model_class:
            self.model_class = model_class
        if not self.model_class:
            raise ValueError("model_class must be specified")
    
    def get_by_id(self, pk: int) -> Optional[T]:
        """Retrieve a single record by primary key."""
        try:
            return self.model_class.objects.get(pk=pk)
        except self.model_class.DoesNotExist:
            return None
    
    def get_all(self, **filters) -> List[T]:
        """Retrieve all records, optionally filtered."""
        return list(self.model_class.objects.filter(**filters))
    
    def create(self, **data) -> T:
        """Create a new record."""
        return self.model_class.objects.create(**data)
    
    def update(self, instance: T, **data) -> T:
        """Update an existing record."""
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance
    
    def delete(self, instance: T) -> bool:
        """Delete a record."""
        instance.delete()
        return True
    
    def exists(self, **filters) -> bool:
        """Check if a record exists."""
        return self.model_class.objects.filter(**filters).exists()
    
    def count(self, **filters) -> int:
        """Count records matching filters."""
        return self.model_class.objects.filter(**filters).count()


class ServiceResult:
    """
    Standardized result wrapper for service operations.
    Provides consistent success/error handling.
    """
    
    def __init__(
        self,
        success: bool,
        data: Any = None,
        error: str = None,
        error_code: str = None
    ):
        self.success = success
        self.data = data
        self.error = error
        self.error_code = error_code
    
    @classmethod
    def ok(cls, data: Any = None) -> 'ServiceResult':
        """Create a successful result."""
        return cls(success=True, data=data)
    
    @classmethod
    def fail(cls, error: str, error_code: str = None) -> 'ServiceResult':
        """Create a failed result."""
        return cls(success=False, error=error, error_code=error_code)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary for API response."""
        if self.success:
            return {'success': True, 'data': self.data}
        return {
            'success': False,
            'error': self.error,
            'error_code': self.error_code
        }
