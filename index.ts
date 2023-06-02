import * as awsNative from "@pulumi/aws-native";

// Create an IDP Provider
const idp = new awsNative.iam.OIDCProvider(
  "github",
  {
    thumbprintList: ["6938fd4d98bab03faadb97b34396831e3780aea1"],
    url: "https://token.actions.githubusercontent.com",
    clientIdList: ["sts.amazonaws.com"],
  },
);

const role = new awsNative.iam.Role(
  "GithubTerraformDeployRole",
  {
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
