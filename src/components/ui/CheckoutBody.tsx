import CommonButton from "../common/CommonButton";
import Loading from "../common/Loading";
import PlaceAutoCompleteCombobox from "../common/PlaceAutoCompleteCombobox";
import PlaceAutoCompleteCombobox from "../common/TestPlaceAutoComplete";
import BluePencil from "../icons/BluePencil";
import DropDownIcon from "../icons/DropDownIcon";
import LocationIcon from "../icons/LocationIcon";
import { type PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js";
import { Transition, Dialog, Listbox } from "@headlessui/react";
import {
  type User,
  type CartItem,
  type Food,
  type FoodOptionItem,
  type Restaurant,
} from "@prisma/client";
import { Formik, Form, Field } from "formik";
import Image from "next/image";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { api } from "~/utils/api";
import countries from "~/utils/countries.json";





export default CheckoutBody;
