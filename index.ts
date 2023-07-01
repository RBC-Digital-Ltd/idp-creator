import * as awsNative from "@pulumi/aws-native";

// Create an IDP Provider
const idp = new awsNative.iam.OIDCProvider(
  "github",
  {
    thumbprintList: ["6938fd4d98bab03faadb97b34396831e3780aea1", "1c58a3a8518e8759bf075b76b750d4f2df264fcd"],
    url: "https://token.actions.githubusercontent.com",
    clientIdList: ["sts.amazonaws.com"],
  },
);

const role = new awsNative.iam.Role(
  "GithubTerraformDeployRole",
  {
    managedPolicyArns: ["arn:aws:iam::aws:policy/AWSCloudFormationFullAccess", "arn:aws:iam::aws:policy/AmazonS3FullAccess", "arn:aws:iam::aws:policy/AWSLambda_FullAccess", "arn:aws:iam::aws:policy/CloudWatchFullAccess", "arn:aws:iam::aws:policy/AmazonAPIGatewayAdministrator"],
    assumeRolePolicyDocument: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            Federated:
              "arn:aws:iam::036486846851:oidc-provider/token.actions.githubusercontent.com",
          },
          Action: "sts:AssumeRoleWithWebIdentity",
          Condition: {
            StringLike: {
              "token.actions.githubusercontent.com:sub": "repo:RBC-Digital-Ltd/*"
            },
            StringEquals: {
              "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            },
          },
        },
      ],
    }),
  },
  {
    dependsOn: idp
  }
);

// Export the name of the bucket
export const roleName = role.roleName;
export const roleArn = role.arn;
export const idpArn = idp.arn;
