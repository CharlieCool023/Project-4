import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://dev-aaduk-we.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  let certificate = ` -----BEGIN CERTIFICATE-----
  MIIDDTCCAfWgAwIBAgIJVF+SLV9eY3tDMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
  BAMTGWRldi1hYWR1ay13ZS51cy5hdXRoMC5jb20wHhcNMjIxMDAzMTM1MjQxWhcN
  MzYwNjExMTM1MjQxWjAkMSIwIAYDVQQDExlkZXYtYWFkdWstd2UudXMuYXV0aDAu
  Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxtuqUQ3MFkkauJwd
  1lrBaa4BO+sajfLJQAuUxNswWI34hKUinym0bmDXGUKwURI0E9G90p4p48d1MCtL
  zPsBwiIq+N56GkMlM+hS3z7rD5kkS7MRZ1Ecko2p7GA+jRVjDORtx9SrWvNF/m4p
  /Chx2we98sAY6QfUK7G8Mm8gF+rHFsu2G0suq+UbIxvFw7kU2Wk7l17qzYMhIJIb
  a7TnR5N3H6EvOsylR4yGboDxmjO0yEM5qqkY9qMX3bU0GJr4ry4vaeb5IBJCQnn6
  LHQpIyImlpN802GgktKnCq0Rqw9jNE1q4HZHP5FzXg2Dp20/Jq8LDacaN6KS/eOq
  soGN/QIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTingJQfbUX
  2HimCuYQUQWUKE53KzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
  ALiIyA9kcnbhQRc4Ib1kwTM+cjVzreQ1FHcCLswkiH+ixas1UjoTJSr6PYlHcsrl
  V6vVDDNYz0rwlVCxV5LlBSRM+NOZjYg5TVrXb0e0WGS53tiIdNcrjVv22yrf+idP
  /zSwxWH8tnjDvdb4mvq6VOAo4okJrCD1/F69JpJCxYYKFYCXX7hYpUrOakVgEwGx
  /ZvYd1tTAykdv+LYpaNx6DRaagOCXibcGGXoljt6ZCteIWCldPpsOhOlbLVbI3Jv
  od+XYaZRx86KWtDgR/orQFA8W9lo5OCjq2n0zIfdwKR+m4U9n4+q5L/TNPeAcL9T
  CAs0hFTDXvMhvpON2VcLAhI=
  -----END CERTIFICATE----- `
  
 return verify(token, certificate, { algorithms: ['RS256']}) as JwtPayload;
};

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
