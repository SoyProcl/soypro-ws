import mongoose from "mongoose";
import { Request, Response, Router } from "express";

import Region from "./region.model";
import City from "./city.model";
import AppController from "../../@core/app.controller";

import _pick from "lodash/pick";
import _get from "lodash/get";
import _set from "lodash/set";

export class LocationController extends AppController {
  all = async (req: Request, res: Response) => {
    try {
      let total = 0;
      let regions = [];
      let cities = [];
      const skip = parseInt(_get(req, "query.skip", 0));
      const limit = parseInt(_get(req, "query.limit", 30));
      let qry = JSON.parse(
        _get(req, "query.query", JSON.stringify({ active: true }))
      );
      const sort = JSON.parse(
        _get(
          req,
          "query.sort",
          JSON.stringify({
            name: 1,
          })
        )
      );

      const name = _get(qry, "name", null);
      if (name && name.trim() !== "") {
        //If filter by name
        delete qry.name;
        qry = {
          ...qry,
          name: { $regex: name, $options: "i" },
        };
      }

      const paginationParams = { skip, limit, sort };
      switch (req.params.type) {
        case "region":
          total = await Region.countDocuments(qry);
          regions = await Region.find(
            qry,
            { _id: 1, name: 1 },
            paginationParams
          );

          // Set total count
          res.setHeader("x-total-count", total);
          res.json(regions);
          break;
        case "city":
          total = await City.countDocuments(qry);
          cities = await City.find(
            qry,
            { _id: 1, name: 1, region: 1 },
            paginationParams
          );
          // Set total count
          res.setHeader("x-total-count", total);
          res.json(cities);
          break;
      }
    } catch (error) {
      this.handleError(req, res)(error);
    }
  };

  async allCities(fields = null, distinct = "_id") {
    try {
      return fields
        ? await City.find({}, fields).lean().distinct(distinct)
        : await City.find({});
    } catch (error) {
      this.notifyError(error);
    }
  }

  create = async (req: Request, res: Response) => {
    try {
      let result = null,
        region = null,
        city = null;
      switch (req.params.type) {
        case "region":
          region = new Region(req.body);
          result = await region.save();
          result = _pick(result, ["_id"]);
          res.status(201).json(result);
          break;
        case "city":
          city = new City(req.body);
          result = await city.save();
          result = _pick(result, ["_id"]);
          //ESTO COMENTADO ERA PARA LA CARGA (CREO) LO MANTENDRE POR EL MOMENTO
          //console.log(req.body)
          // req.body.forEach(async element => {
          //   city = new City(element)
          //   await city.save()
          // });

          // result = true
          res.status(201).json(result);
          break;
      }
    } catch (error) {
      this.handleError(req, res)(error);
    }
  };

  cityByTxt = async (txt: string) => {
    try {
      const city: any = await City.findOne(
        {
          name: { $regex: txt.toLowerCase(), $options: "i" },
        },
        { _id: 1, region: 1 }
      );

      return Promise.resolve({
        city: city._id,
        region: city.region,
      });
    } catch (error) {
      console.log("error", error);
      return Promise.reject(error);
    }
  };

  findLocationTxt = async (txt: string) => {
    try {
      let cityArray = [];
      const region = await Region.findOne({
        name: { $regex: txt, $options: "i" },
      });
      if (region) {
        const cities = await this.getCityByRegion(region._id);
        cities.forEach((value) => {
          cityArray.push(value._id);
        });
      } else {
        const city = await City.findOne({
          name: { $regex: txt, $options: "i" },
        });
        if (city) cityArray.push(city._id);
      }

      return cityArray;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  getCityByRegion = async (id: string, fields = { _id: 1 }) => {
    try {
      return await City.find({ region: mongoose.Types.ObjectId(id) }, fields)
        .lean()
        .distinct("_id");
    } catch (error) {
      return Promise.reject(error);
    }
  };
}
export default new LocationController();
