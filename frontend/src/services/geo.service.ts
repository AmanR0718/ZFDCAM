// src/services/geo.service.ts
import axiosClient from "@/utils/axios";

const geoService = {
  async provinces() {
    const { data } = await axiosClient.get("/geo/provinces");
    return data;
  },

  async districts(province_id?: string) {
    const { data } = await axiosClient.get("/geo/districts", {
      params: province_id ? { province_id } : {},
    });
    return data;
  },

  async chiefdoms(district_id?: string) {
    const { data } = await axiosClient.get("/geo/chiefdoms", {
      params: district_id ? { district_id } : {},
    });
    return data;
  },
};

export default geoService;
