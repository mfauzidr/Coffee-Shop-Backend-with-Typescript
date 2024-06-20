import { Request } from "express-serve-static-core";
import { AppParams, QueryParams } from "../models/params";
import { IProductsQueryParams } from "../models/products";

const paginLink = (req: Request<AppParams, {}, {}, QueryParams>, info?: "previous" | "next"): string => {
  const { path, hostname, query, protocol, baseUrl } = req;
  const getNewPage = (page: string = '1'): number => {
    if (info === "next") return parseInt(page) + 1;
    if (info === "previous") return parseInt(page) - 1;
    return parseInt(page);
  };
  const newQuery = { ...query, page: `${getNewPage(query.page as string)}` };
  const serialize = (query: IProductsQueryParams): string => {
    const str: any[] = [];
    for (let key in query) {
      if ((query as Object).hasOwnProperty(key)) {
        str.push(`${encodeURIComponent(key)}=${encodeURIComponent((query as Record<string, string>)[key])}`);
      }
    }
    return str.join("&");
  };
  const newUrl = (url: string): string => {
    if (url == "/") return "";
    return url;
  };
  return `${protocol}://${hostname}:${process.env.PORT}${newUrl(baseUrl)}${newUrl(path)}?${serialize(newQuery)}`;
};

export default paginLink;