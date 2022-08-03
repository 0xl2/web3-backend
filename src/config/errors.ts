export const Errors = {
  INVALID_REQUEST_BODY: {
    errorCode: 400,
    errorTitle: 'Invalid Request Body',
    errorDescription:
      'Generally something is wrong with the structure of your JSON body. Please make sure that if you\'re using one of the provided examples, you subsitute the defaults written like "<enter your id>" with an entity that you created.',
  },
  BAD_API_KEY: {
    errorCode: 412,
    errorTitle: 'Bad API Key',
    errorDescription:
      'This means that either your API key has been inserted incorrectly or the API key has been disabled or deleted and is no longer associated with the game.',
  },
  INVALID_UUID_FORMAT: {
    errorCode: 500,
    errorTitle: 'Invalid UUID Format',
    errorDescription:
      "The provide player ID is written incorrectly, double check you've correctly inserted the full length of the UUID.",
  },
  ENTITY_AND_GAME_MISMATCH: {
    errorCode: 500,
    errorTitle: '<entity> & Game Mismatch',
    errorDescription:
      'There are two problems that can occur with this error. First, is that the entity you want does not exist anymore. Second, the entity does exist, just that the provided API key does not belong to it.',
  },
  DUPLICATE_UNIQUE_ID: {
    errorCode: 500,
    errorTitle: 'Duplicate Unique ID',
    errorDescription:
      'When creating a player, if the unique ID provided to identify a player is currently in use by another player, you will get this error letting you know that it is unavailabe and that you need to use a different unique ID.',
  },
  INVALID_FORMAT: {
    errorCode: 500,
    errorTitle: 'Invalid Format',
    errorDescription:
      'Generally something is wrong with the structure of the API call itself. Please check to make sure that you\'ve substituted any provided defaults "<insert your id>" with an actually id you\'ve obtained using the API.',
  },
  INVAOID_FT_MINT: {
    errorCode: 500,
    errorTitle: 'Invalid FT Mint',
    errorDescription:
      "This occurs when trying to mint an FT to a player, and you've added metadata to the request body. This is not allowed as by providing a fungible token with metadata that it specific to itself no longer makes it fungible. Please remove metadata properties from your API call. If you'd like metadata to be associated with ALL your fungible tokens, please add that metadata when creating the template of that token in /template/create.",
  },
  USER_NOT_FOUND: {
    errorCode: 500,
    errorTitle: 'User Not Found',
    errorDescription:
      'The given player UUID does not exist, double check that the UUID is provided correctly, or that the player was not deleted.',
  },
  PLAYER_LACKS_OWNERSHIP: {
    errorCode: 500,
    errorTitle: 'Player Lacks Ownership',
    errorDescription:
      "This error occurs when trying to update a players token, and the provided tokenId is not found in the players wallet. Please check to make sure you're using the correct tokenId(and not the templateId) and the correct player UUID.",
  },
};
