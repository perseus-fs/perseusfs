export const CODE_READ_BOILERPLATE = `async (req, file, bucket) => {
  // return true to allow the request
  // return false to reject the request
  // req.user contains the user making the request if authenticated
  // file contains the file object the user is trying to access
  // bucket contains the bucket object the file is in
  // you can use req.user.getBucketPermissions(bucket.id) to get the user's permissions for the bucket
  // return true to allow the request and retrieve the file
  // return false to reject the request with a 403 Forbidden status code

  return true;
};
`;

export const CODE_WRITE_BOILERPLATE = `async (req, fileName, bucket) => {
  // return true to allow the request
  // return false to reject the request
  // req.user contains the user making the request if authenticated
  // fileName contains the name of the file the user is trying to upload
  // bucket contains the target bucket object for the file upload
  // you can use req.user.getBucketPermissions(bucket.id) to get the user's permissions for the bucket
  // return true to allow the request and retrieve the file
  // return false to reject the request with a 403 Forbidden status code

  return true;
};
`;

export const DATE_FORMAT = 'PPp P';

export const DEFAULT_PAGE_SIZE = 25;
