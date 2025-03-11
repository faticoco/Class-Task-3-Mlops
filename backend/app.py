import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from bson.objectid import ObjectId
import json

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient(os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/mlops'))
db = client.get_database()
tasks = db.tasks

# Custom JSON encoder to handle ObjectId and datetime
class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super(MongoJSONEncoder, self).default(obj)

app.json_encoder = MongoJSONEncoder

@app.route('/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks, sorted by creation date"""
    result = list(tasks.find().sort('createdAt', -1))
    return jsonify(result)

@app.route('/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    data = request.json
    
    # Validate required fields
    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    
    # Create task document
    task = {
        'title': data.get('title'),
        'description': data.get('description', ''),
        'priority': data.get('priority', 'medium'),
        'dueDate': data.get('dueDate'),
        'completed': False,
        'createdAt': datetime.now(),
        'updatedAt': datetime.now()
    }
    
    # Insert task into database
    result = tasks.insert_one(task)
    
    # Return the created task
    created_task = tasks.find_one({'_id': result.inserted_id})
    return jsonify(created_task), 201

@app.route('/tasks/<task_id>', methods=['GET'])
def get_task(task_id):
    """Get a specific task by ID"""
    task = tasks.find_one({'_id': ObjectId(task_id)})
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(task)

@app.route('/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task"""
    data = request.json
    
    # Validate required fields
    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    
    # Prepare update data
    update_data = {
        'title': data.get('title'),
        'description': data.get('description', ''),
        'priority': data.get('priority', 'medium'),
        'dueDate': data.get('dueDate'),
        'updatedAt': datetime.now()
    }
    
    # Update the task
    result = tasks.update_one(
        {'_id': ObjectId(task_id)},
        {'$set': update_data}
    )
    
    if result.matched_count == 0:
        return jsonify({'error': 'Task not found'}), 404
    
    # Return the updated task
    updated_task = tasks.find_one({'_id': ObjectId(task_id)})
    return jsonify(updated_task)

@app.route('/tasks/<task_id>', methods=['PATCH'])
def patch_task(task_id):
    """Partially update a task (e.g., mark as completed)"""
    data = request.json
    
    # Prepare update data
    update_data = {
        'updatedAt': datetime.now()
    }
    
    # Add any fields that were provided
    for key, value in data.items():
        if key not in ['_id', 'createdAt']:
            update_data[key] = value
    
    # Update the task
    result = tasks.update_one(
        {'_id': ObjectId(task_id)},
        {'$set': update_data}
    )
    
    if result.matched_count == 0:
        return jsonify({'error': 'Task not found'}), 404
    
    # Return the updated task
    updated_task = tasks.find_one({'_id': ObjectId(task_id)})
    return jsonify(updated_task)

@app.route('/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    result = tasks.delete_one({'_id': ObjectId(task_id)})
    
    if result.deleted_count == 0:
        return jsonify({'error': 'Task not found'}), 404
    
    return jsonify({'message': 'Task deleted successfully'})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')