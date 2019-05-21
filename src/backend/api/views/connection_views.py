from flask import request
from flask_restplus import Resource

from ..managers.auth_manager import token_required
from ..serializers import ConnectionSerializer
from ..managers import copy_job_manager


api = ConnectionSerializer.api
dto = ConnectionSerializer.dto


"""
GET    /api/connections List Connections
POST   /api/connections UserConnectionAdd (called 'remotes' in rclone)
PATCH  /api/connections/$id UserConnectionModify
DELETE /api/connections/$id UserConnectionDelete
"""

@api.route('/')
class ConnectionList(Resource):
    @api.marshal_list_with(dto)
    def get(self):
        """List all Connections"""
        return copy_job_manager.list()


    @api.response(201, 'User successfully created.')
    @api.expect(dto, validate=True)
    def post(self):
        """Create a new Connection"""
        data = request.json
        return copy_job_manager.create(data=data)



@api.route('/<id>')
@api.param('id', 'The Connection Identifier')
@api.response(404, 'Connection not found.')
class Connection(Resource):
    @api.marshal_with(dto, code=200)
    def get(self, id):
        """Get a specific Connection"""
        result = copy_job_manager.retrieve(id)
        if not result:
            api.abort(404)
        else:
            return result

    @api.marshal_with(dto, code=200)
    def patch(self, id):
        """Edit a specific Connection"""
        result = copy_job_manager.retrieve(id)
        if not result:
            api.abort(404)
        else:
            return result

    @api.marshal_with(dto, code=200)
    def delete(self, id):
        """Delete a specific Connection"""
        result = copy_job_manager.retrieve(id)
        if not result:
            api.abort(404)
        else:
            return result
