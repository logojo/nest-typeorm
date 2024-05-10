import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const Rawheaders = createParamDecorator(
    ( data, ctx : ExecutionContext) => {
      const req = ctx.switchToHttp().getRequest();
      const headers = req.rawHeaders;

      return headers;
    }
)