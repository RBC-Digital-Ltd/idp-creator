import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as awsNative from "@pulumi/aws-native";

// Create an IDP Provider
const idp = new awsNative.iam.OIDCProvider("github", {
  thumbprintList: ["6938fd4d98bab03faadb97b34396831e3780aea1"],
  url: "https://token.actions.githubusercontent.com",
  clientIdList: ["sts.amazonaws.com"],
});

const role = new awsNative.iam.Role("GithubTerraformDeployRole", {
  managedPolicyArns: ["arn:aws:iam::aws:policy/AdministratorAccess"],
  assumeRolePolicyDocument: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRoleWithWebIdentity",
        Effect: "Allow",
        Principal: {
          Federated: idp.arn,
        },
        Condition: {
          StringLike: {
            "token.actions.githubusercontent.com:sub":
              "repo:RBC-Digital-Ltd/*:*",
          },
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          },
        },
      },
    ],
  }),
});

// Export the name of the bucket
export const roleName = role.roleName;
export const roleArn = role.arn;
