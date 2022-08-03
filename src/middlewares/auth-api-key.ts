import httpStatus from 'http-status';
import { ApiError } from '@/utils/api';
import { ROLES } from '@/config/roles';
import { UserService } from '@/services';
import { checkDocExists } from '@/utils/helpers';
import { ApiKeyService } from '@/services/apiKey.service';

export const authApiKey = async (req: any, res: any, next: any) => {
  if (req.user) return next();

  const providedApiKey = req.headers.authorization;
  const apiKey = await ApiKeyService.getApiKeyByValue(providedApiKey);

  if (!apiKey) {
    return next(new ApiError(httpStatus.NOT_FOUND, `Api Key with value - ${providedApiKey} not found.`));
  }

  if (!apiKey.isApiKeyMatch(providedApiKey)) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate.'));
  } else {
    const user = await UserService.getUserById(apiKey.issuer.toString());

    if (!user) {
      return next(new ApiError(httpStatus.NOT_FOUND, `User with id - ${apiKey.issuer.toString()} not found.`));
    }

    if (user.role !== ROLES.ADMIN) {
      return next(new ApiError(httpStatus.FORBIDDEN, "User doesn't have admin permissions."));
    }

    req.user = user;
    return next();
  }
};
