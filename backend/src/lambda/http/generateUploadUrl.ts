import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger';
import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    
    const userId = getUserId(event);
    const logger = createLogger("generateUploadUrl");
    const uploadUrl = await createAttachmentPresignedUrl(todoId,userId);

    logger.info(`Generated upload url for userId=${userId}, todoId=${todoId}`);

    return {
        statusCode: 200,
        body: JSON.stringify({ uploadUrl }),
        headers: {
            'Access-Control-Allow-Origin': "*",
        },
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )