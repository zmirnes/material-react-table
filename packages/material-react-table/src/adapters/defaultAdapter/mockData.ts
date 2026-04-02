import type { GridSortDirection } from "@mui/x-data-grid-premium";
import type { IGridDataResponse } from "./types";
import { generateRows } from "./dataFaker";

export const initialStateMock = {
  pagination: {
    paginationModel: {
      page: 1,
      pageSize: 25,
    },
  },
  sorting: {
    sortModel: [
      {
        field: "__check__",
        sort: "desc" as GridSortDirection,
      },
    ],
    sortedRows: [],
  },
  columns: {
    columnVisibilityModel: {
      note: false,
      created_at: false,
      updated_at: false,
      updated_by: false,
      created_by: false,
      salutation: false,
      addresses_created_at: false,
      addresses_updated_at: false,
      addresses_deleted_at: false,
    },
    orderedFields: [
      "__check__",
      "__tree_data_group__",
      "document_type",
      "document_number",
      "customer_number",
      "note",
      "business_partner",
      "date_of_change",
      "date_of_assembly",
      "date_of_delivery",
      "date_of_measurement",
      "date_of_installation",
      "date_of_production",
      "date_of_cutting_start",
      "date_of_planned_production",
      "status",
      "created_at",
      "updated_at",
      "updated_by",
      "created_by",
      "salutation",
      "first_name",
      "last_name",
      "company",
      "additional",
      "additional_2",
      "letter_salutation",
      "street",
      "postcode",
      "city",
      "post_office_box",
      "postcode_address",
      "country",
      "email",
      "phone",
      "mobile",
      "fax",
      "addresses_created_at",
      "addresses_updated_at",
      "addresses_deleted_at",
      "actions",
    ],
    dimensions: {
      __check__: {
        maxWidth: -1,
        minWidth: 50,
        width: 50,
      },
      document_number: {
        maxWidth: -1,
        minWidth: 50,
        width: 257,
        flex: 0,
      },
    },
  },
  density: "compact" as const,
  pageSizeOptions: [10, 25, 50, 100],
  gridColDef: [
    {
      field: "__check__",
      type: "checkboxSelection",
      headerName: "ID",
      aggregable: false,
      filterable: false,
      groupable: false,
      minWidth: 50,
      width: 50,
    },
    {
      field: "document_type",
      type: "enum",
      headerName: "Tip dokumenta",
      enumValues: [
        {
          value: "order",
          label: "Order",
        },
        {
          value: "project",
          label: "Project",
        },
      ],
    },
    {
      field: "document_number",
      type: "string",
      headerName: "DataGrid.document_number",
      availableAggregationFunctions: ["size"],
      minWidth: 50,
      width: 257,
    },
    {
      field: "customer_number",
      type: "string",
      headerName: "DataGrid.customer_number",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "note",
      type: "string",
      headerName: "DataGrid.note",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "business_partner",
      type: "object",
      headerName: "DataGrid.business_partner",
      aggregable: false,
      filterable: false,
      groupable: false,
      sortable: false,
      extraFieldFilters: [
        {
          field: "business_partner[salutation]",
          type: "string",
        },
        {
          field: "business_partner[first_name]",
          type: "string",
        },
        {
          field: "business_partner[last_name]",
          type: "string",
        },
        {
          field: "business_partner[company]",
          type: "string",
        },
        {
          field: "business_partner[additional]",
          type: "string",
        },
        {
          field: "business_partner[additional_2]",
          type: "string",
        },
        {
          field: "business_partner[letter_salutation]",
          type: "string",
        },
        {
          field: "business_partner[street]",
          type: "string",
        },
        {
          field: "business_partner[postcode]",
          type: "string",
        },
        {
          field: "business_partner[city]",
          type: "string",
        },
        {
          field: "business_partner[post_office_box]",
          type: "string",
        },
        {
          field: "business_partner[postcode_address]",
          type: "string",
        },
        {
          field: "business_partner[country]",
          type: "string",
        },
      ],
    },
    {
      field: "date_of_change",
      type: "date",
      headerName: "DataGrid.date_of_change",
      availableAggregationFunctions: ["min", "max", "size"],
    },
    {
      field: "date_of_assembly",
      type: "date",
      headerName: "DataGrid.date_of_assembly",
      availableAggregationFunctions: ["min", "max", "size"],
    },
    {
      field: "date_of_delivery",
      type: "date",
      headerName: "DataGrid.date_of_delivery",
      availableAggregationFunctions: ["min", "max", "size"],
    },
    {
      field: "date_of_measurement",
      type: "date",
      headerName: "DataGrid.date_of_measurement",
      availableAggregationFunctions: ["min", "max", "size"],
    },
    {
      field: "date_of_installation",
      type: "date",
      headerName: "DataGrid.date_of_installation",
      availableAggregationFunctions: ["min", "max", "size"],
    },
    {
      field: "date_of_production",
      type: "date",
      headerName: "DataGrid.date_of_production",
      availableAggregationFunctions: ["min", "max", "size"],
    },
    {
      field: "date_of_cutting_start",
      type: "date",
      headerName: "DataGrid.date_of_cutting_start",
      availableAggregationFunctions: ["min", "max", "size"],
    },
    {
      field: "date_of_planned_production",
      type: "date",
      headerName: "DataGrid.date_of_planned_production",
      availableAggregationFunctions: ["min", "max", "size"],
    },
    {
      field: "status",
      type: "enum",
      headerName: "Status",
      enumValues: [
        {
          value: "draft",
          label: "Draft",
        },
        {
          value: "opened",
          label: "Opened",
        },
        {
          value: "confirmed",
          label: "Confirmed",
        },
        {
          value: "done",
          label: "Done",
        },
        {
          value: "canceled",
          label: "Canceled",
        },
      ],
    },
    {
      field: "created_at",
      type: "dateTime",
      headerName: "DataGrid.created_at",
      availableAggregationFunctions: ["min", "max", "size"],
    },
    {
      field: "updated_at",
      type: "dateTime",
      headerName: "DataGrid.updated_at",
      availableAggregationFunctions: ["min", "max", "size"],
    },
    {
      field: "updated_by",
      type: "string",
      headerName: "DataGrid.updated_by",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "created_by",
      type: "string",
      headerName: "DataGrid.created_by",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "salutation",
      type: "string",
      headerName: "Salutation",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "first_name",
      type: "string",
      headerName: "First Name",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "last_name",
      type: "string",
      headerName: "Last Name",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "company",
      type: "string",
      headerName: "Company",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "additional",
      type: "string",
      headerName: "Additional",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "additional_2",
      type: "string",
      headerName: "Additional 2",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "letter_salutation",
      type: "string",
      headerName: "Letter Salutation",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "street",
      type: "string",
      headerName: "Street",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "postcode",
      type: "string",
      headerName: "Postcode",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "city",
      type: "string",
      headerName: "City",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "post_office_box",
      type: "string",
      headerName: "Post Office Box",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "postcode_address",
      type: "string",
      headerName: "Postcode addresses",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "country",
      type: "enum",
      headerName: "Country",
      enumValues: [
        {
          value: "ABW",
          label: "Aruba",
        },
        {
          value: "AFG",
          label: "Islamska Republika Afganistan",
        },
        {
          value: "AGO",
          label: "Republika Angola",
        },
        {
          value: "AIA",
          label: "Anguilla",
        },
        {
          value: "ALA",
          label: "Aland Islands",
        },
        {
          value: "ALB",
          label: "Republika Albanija",
        },
        {
          value: "AND",
          label: "Kneževina Andora",
        },
        {
          value: "ARE",
          label: "Ujedinjeni Arapski Emirati",
        },
        {
          value: "ARG",
          label: "Argentinski Republika",
        },
        {
          value: "ARM",
          label: "Republika Armenija",
        },
        {
          value: "ASM",
          label: "američka Samoa",
        },
        {
          value: "ATA",
          label: "Antarktika",
        },
        {
          value: "ATF",
          label: "Teritoriju Francuski južni i antarktički teritoriji",
        },
        {
          value: "ATG",
          label: "Antigva i Barbuda",
        },
        {
          value: "AUS",
          label: "Commonwealth of Australia",
        },
        {
          value: "AUT",
          label: "Republika Austrija",
        },
        {
          value: "AZE",
          label: "Republika Azerbajdžan",
        },
        {
          value: "BDI",
          label: "Burundi",
        },
        {
          value: "BEL",
          label: "Kraljevina Belgija",
        },
        {
          value: "BEN",
          label: "Republika Benin",
        },
        {
          value: "BFA",
          label: "Burkina Faso",
        },
        {
          value: "BGD",
          label: "Narodna Republika Bangladeš",
        },
        {
          value: "BGR",
          label: "Republika Bugarska",
        },
        {
          value: "BHR",
          label: "Kraljevina Bahrein",
        },
        {
          value: "BHS",
          label: "Zajednica Bahama",
        },
        {
          value: "BIH",
          label: "Bosna i Hercegovina",
        },
        {
          value: "BLM",
          label: "Kolektivnost sv Barthélemy",
        },
        {
          value: "SHN",
          label: "Sveta Helena",
        },
        {
          value: "BLR",
          label: "Republika Bjelorusija",
        },
        {
          value: "BLZ",
          label: "Belize",
        },
        {
          value: "BMU",
          label: "Bermuda",
        },
        {
          value: "BOL",
          label: "Plurinational State of Bolivia",
        },
        {
          value: "BES",
          label: "Bonaire, Sint Eustatius i Saba",
        },
        {
          value: "BRA",
          label: "Savezne Republike Brazil",
        },
        {
          value: "BRB",
          label: "Barbados",
        },
        {
          value: "BRN",
          label: "Nacija od Bruneja, Kuću Mira",
        },
        {
          value: "BTN",
          label: "Kraljevina Butan",
        },
        {
          value: "BVT",
          label: "Bouvet Island",
        },
        {
          value: "BWA",
          label: "Republika Bocvana",
        },
        {
          value: "CAF",
          label: "Centralna Afrička Republika",
        },
        {
          value: "CAN",
          label: "Kanada",
        },
        {
          value: "CCK",
          label: "Teritoriju Kokosovi (Keeling) Islands",
        },
        {
          value: "CHE",
          label: "švicarska Konfederacija",
        },
        {
          value: "CHL",
          label: "Republika Čile",
        },
        {
          value: "CHN",
          label: "Narodna Republika Kina",
        },
        {
          value: "CIV",
          label: "Republika Côte d'Ivoire",
        },
        {
          value: "CMR",
          label: "Republika Kamerun",
        },
        {
          value: "COD",
          label: "Demokratska Republika Kongo",
        },
        {
          value: "COG",
          label: "Republika Kongo",
        },
        {
          value: "COK",
          label: "Cook Islands",
        },
        {
          value: "COL",
          label: "Republika Kolumbija",
        },
        {
          value: "COM",
          label: "Savez Komori",
        },
        {
          value: "CPV",
          label: "Republika Cabo Verde",
        },
        {
          value: "CRI",
          label: "Republika Kostarika",
        },
        {
          value: "CUB",
          label: "Republika Kuba",
        },
        {
          value: "CUW",
          label: "Curaçao",
        },
        {
          value: "CXR",
          label: "Teritorij Božićni otok",
        },
        {
          value: "CYM",
          label: "Kajmanski otoci",
        },
        {
          value: "CYP",
          label: "Republika Cipar",
        },
        {
          value: "CZE",
          label: "Češka",
        },
        {
          value: "DEU",
          label: "Njemačka Federativna Republika",
        },
        {
          value: "DJI",
          label: "Republika Džibuti",
        },
        {
          value: "DMA",
          label: "Zajednica Dominika",
        },
        {
          value: "DNK",
          label: "Kraljevina Danska",
        },
        {
          value: "DOM",
          label: "Dominikanska Republika",
        },
        {
          value: "DZA",
          label: "Narodna Demokratska Republika Alžir",
        },
        {
          value: "ECU",
          label: "Republika Ekvador",
        },
        {
          value: "EGY",
          label: "Arapska Republika Egipat",
        },
        {
          value: "ERI",
          label: "Država Eritreji",
        },
        {
          value: "ESH",
          label: "Sahrawi Arab Demokratska Republika",
        },
        {
          value: "ESP",
          label: "Kraljevina Španjolska",
        },
        {
          value: "EST",
          label: "Republika Estonija",
        },
        {
          value: "ETH",
          label: "Savezna Demokratska Republika Etiopija",
        },
        {
          value: "FIN",
          label: "Republika Finska",
        },
        {
          value: "FJI",
          label: "Republika Fidži",
        },
        {
          value: "FLK",
          label: "Falklandski otoci",
        },
        {
          value: "FRA",
          label: "Francuska Republika",
        },
        {
          value: "FRO",
          label: "Farski Otoci",
        },
        {
          value: "FSM",
          label: "Savezne Države Mikronezije",
        },
        {
          value: "GAB",
          label: "Gabon Republika",
        },
        {
          value: "GBR",
          label: "Ujedinjeno Kraljevstvo Velike Britanije i Sjeverne Irske",
        },
        {
          value: "GEO",
          label: "Gruzija",
        },
        {
          value: "GGY",
          label: "Struka Guernsey",
        },
        {
          value: "GHA",
          label: "Republika Gana",
        },
        {
          value: "GIB",
          label: "Gibraltar",
        },
        {
          value: "GIN",
          label: "Republika Gvineja",
        },
        {
          value: "GLP",
          label: "Gvadalupa",
        },
        {
          value: "GMB",
          label: "Republika Gambija",
        },
        {
          value: "GNB",
          label: "Republika Gvineja Bisau",
        },
        {
          value: "GNQ",
          label: "Republika Ekvatorska Gvineja",
        },
        {
          value: "GRC",
          label: "Helenska Republika",
        },
        {
          value: "GRD",
          label: "Grenada",
        },
        {
          value: "GRL",
          label: "Grenland",
        },
        {
          value: "GTM",
          label: "Republika Gvatemala",
        },
        {
          value: "GUF",
          label: "Gijana",
        },
        {
          value: "GUM",
          label: "Guam",
        },
        {
          value: "GUY",
          label: "Zadruga Republika Gvajana",
        },
        {
          value: "HKG",
          label: "Hong Kong Posebnog upravnog područjaNarodne Republike Kine",
        },
        {
          value: "HMD",
          label: "Otok Heard i otočje McDonald",
        },
        {
          value: "HND",
          label: "Republika Honduras",
        },
        {
          value: "HRV",
          label: "Republika Hrvatska",
        },
        {
          value: "HTI",
          label: "Republika Haiti",
        },
        {
          value: "HUN",
          label: "Madžarska",
        },
        {
          value: "IDN",
          label: "Republika Indonezija",
        },
        {
          value: "IMN",
          label: "Mana ostrvo",
        },
        {
          value: "IND",
          label: "Republika Indija",
        },
        {
          value: "IOT",
          label: "British Indian Ocean Territory",
        },
        {
          value: "IRL",
          label: "Republika Irska",
        },
        {
          value: "IRN",
          label: "Islamska Republika Iran",
        },
        {
          value: "IRQ",
          label: "Republika Irak",
        },
        {
          value: "ISL",
          label: "Island",
        },
        {
          value: "ISR",
          label: "Država Izrael",
        },
        {
          value: "ITA",
          label: "talijanska Republika",
        },
        {
          value: "JAM",
          label: "Jamajka",
        },
        {
          value: "JEY",
          label: "Struka od Jersey",
        },
        {
          value: "JOR",
          label: "Hašemitske Kraljevine Jordan",
        },
        {
          value: "JPN",
          label: "Japan",
        },
        {
          value: "KAZ",
          label: "Republika Kazahstan",
        },
        {
          value: "KEN",
          label: "Republika Kenija",
        },
        {
          value: "KGZ",
          label: "Kirgistanu",
        },
        {
          value: "KHM",
          label: "Kraljevina Kambodža",
        },
        {
          value: "KIR",
          label: "Samostalne i suverene Republike Kiribati",
        },
        {
          value: "KNA",
          label: "Federacija Sv.Kristofora i Nevisa",
        },
        {
          value: "KOR",
          label: "Republika Koreja",
        },
        {
          value: "UNK",
          label: "Republika Kosovo",
        },
        {
          value: "KWT",
          label: "Država Kuvajt",
        },
        {
          value: "LAO",
          label: "Narodna Demokratska Republika",
        },
        {
          value: "LBN",
          label: "Libanonska Republika",
        },
        {
          value: "LBR",
          label: "Republika Liberija",
        },
        {
          value: "LBY",
          label: "Država Libiji",
        },
        {
          value: "LCA",
          label: "Sveta Lucija",
        },
        {
          value: "LIE",
          label: "Kneževina Lihtenštajn",
        },
        {
          value: "LKA",
          label: "Demokratska Socijalističke Republike Šri Lanke",
        },
        {
          value: "LSO",
          label: "Kraljevina Lesoto",
        },
        {
          value: "LTU",
          label: "Republika Litva",
        },
        {
          value: "LUX",
          label: "Veliko Vojvodstvo Luksemburg",
        },
        {
          value: "LVA",
          label: "Republika Latvija",
        },
        {
          value: "MAC",
          label: "Makao Posebnog upravnog područjaNarodne Republike Kine",
        },
        {
          value: "MAF",
          label: "Saint Martin",
        },
        {
          value: "MAR",
          label: "Kraljevina Maroko",
        },
        {
          value: "MCO",
          label: "Kneževina Monako",
        },
        {
          value: "MDA",
          label: "Moldavija",
        },
        {
          value: "MDG",
          label: "Republika Madagaskar",
        },
        {
          value: "MDV",
          label: "Republika Maldivi",
        },
        {
          value: "MEX",
          label: "Sjedinjene Meksičke Države",
        },
        {
          value: "MHL",
          label: "Republika Maršalovi Otoci",
        },
        {
          value: "MKD",
          label: "Republika Sjeverna Makedonija",
        },
        {
          value: "MLI",
          label: "Republika Mali",
        },
        {
          value: "MLT",
          label: "Republika Malta",
        },
        {
          value: "MMR",
          label: "Republika Unije Mijanmar",
        },
        {
          value: "MNE",
          label: "Crna Gora",
        },
        {
          value: "MNG",
          label: "Mongolija",
        },
        {
          value: "MNP",
          label: "Zajednica je Sjeverni Marijanski otoci",
        },
        {
          value: "MOZ",
          label: "Republika Mozambiku",
        },
        {
          value: "MRT",
          label: "Islamska Republika Mauritanija",
        },
        {
          value: "MSR",
          label: "Montserrat",
        },
        {
          value: "MTQ",
          label: "Martinique",
        },
        {
          value: "MUS",
          label: "Republika Mauricijus",
        },
        {
          value: "MWI",
          label: "Republika Malavi",
        },
        {
          value: "MYS",
          label: "Malezija",
        },
        {
          value: "MYT",
          label: "Odjel Mayotte",
        },
        {
          value: "NAM",
          label: "Republika Namibija",
        },
        {
          value: "NCL",
          label: "Nova Kaledonija",
        },
        {
          value: "NER",
          label: "Republika Niger",
        },
        {
          value: "NFK",
          label: "Teritorij Norfolk Island",
        },
        {
          value: "NGA",
          label: "Savezna Republika Nigerija",
        },
        {
          value: "NIC",
          label: "Republika Nikaragva",
        },
        {
          value: "NIU",
          label: "Niue",
        },
        {
          value: "NLD",
          label: "Holandija",
        },
        {
          value: "NOR",
          label: "Kraljevina Norveška",
        },
        {
          value: "NPL",
          label: "Savezna Demokratska Republika Nepal",
        },
        {
          value: "NRU",
          label: "Republika Nauru",
        },
        {
          value: "NZL",
          label: "Novi Zeland",
        },
        {
          value: "OMN",
          label: "Sultanat Oman",
        },
        {
          value: "PAK",
          label: "Islamska Republika Pakistan",
        },
        {
          value: "PAN",
          label: "Republika Panama",
        },
        {
          value: "PCN",
          label: "Pitcairn skupine otoka",
        },
        {
          value: "PER",
          label: "Republika Peru",
        },
        {
          value: "PHL",
          label: "Republika Filipini",
        },
        {
          value: "PLW",
          label: "Republika Palau",
        },
        {
          value: "PNG",
          label: "Nezavisna Država Papui Novoj Gvineji",
        },
        {
          value: "POL",
          label: "Republika Poljska",
        },
        {
          value: "PRI",
          label: "Zajednica Puerto Rico",
        },
        {
          value: "PRK",
          label: "Demokratska Narodna Republika Koreja",
        },
        {
          value: "PRT",
          label: "Portugalska Republika",
        },
        {
          value: "PRY",
          label: "Republika Paragvaj",
        },
        {
          value: "PSE",
          label: "State of Palestine",
        },
        {
          value: "PYF",
          label: "Francuska Polinezija",
        },
        {
          value: "QAT",
          label: "Država Katar",
        },
        {
          value: "REU",
          label: "Réunion Island",
        },
        {
          value: "ROU",
          label: "Rumunija",
        },
        {
          value: "RUS",
          label: "Ruska Federacija",
        },
        {
          value: "RWA",
          label: "Republika Ruandi",
        },
        {
          value: "SAU",
          label: "Kraljevina Saudijska Arabija",
        },
        {
          value: "SDN",
          label: "Republika Sudan",
        },
        {
          value: "SEN",
          label: "Republika Senegal",
        },
        {
          value: "SGP",
          label: "Republika Singapur",
        },
        {
          value: "SGS",
          label: "Južna Džordžija i Otoci Južni Sendvič",
        },
        {
          value: "SJM",
          label: "Svalbard og Jan Mayen",
        },
        {
          value: "SLB",
          label: "Solomonski Otoci",
        },
        {
          value: "SLE",
          label: "Republika Sijera Leone",
        },
        {
          value: "SLV",
          label: "Republika El Salvador",
        },
        {
          value: "SMR",
          label: "Većina Serene Republika San Marino",
        },
        {
          value: "SOM",
          label: "Savezna Republika Somaliji",
        },
        {
          value: "SPM",
          label: "Saint Pierre i Miquelon",
        },
        {
          value: "SRB",
          label: "Republika Srbija",
        },
        {
          value: "SSD",
          label: "Republika Južni Sudan",
        },
        {
          value: "STP",
          label: "Demokratska Republika São Tome i Principe",
        },
        {
          value: "SUR",
          label: "Republika Surinam",
        },
        {
          value: "SVK",
          label: "slovačka",
        },
        {
          value: "SVN",
          label: "Republika Slovenija",
        },
        {
          value: "SWE",
          label: "Kraljevina Švedska",
        },
        {
          value: "SWZ",
          label: "Kraljevina eSwatini",
        },
        {
          value: "SXM",
          label: "Sveti Martin",
        },
        {
          value: "SYC",
          label: "Republika Sejšeli",
        },
        {
          value: "SYR",
          label: "Sirijska Arapska Republika",
        },
        {
          value: "TCA",
          label: "Otoci Turks i Caicos",
        },
        {
          value: "TCD",
          label: "Čadu",
        },
        {
          value: "TGO",
          label: "Togolese Republika",
        },
        {
          value: "THA",
          label: "Kraljevina Tajland",
        },
        {
          value: "TJK",
          label: "Republika Tadžikistan",
        },
        {
          value: "TKL",
          label: "Tokelau",
        },
        {
          value: "TKM",
          label: "Turkmenistan",
        },
        {
          value: "TLS",
          label: "Demokratska Republika Timor-Leste",
        },
        {
          value: "TON",
          label: "Kraljevina Tonga",
        },
        {
          value: "TTO",
          label: "Republika Trinidad i Tobago",
        },
        {
          value: "TUN",
          label: "Tuniski Republika",
        },
        {
          value: "TUR",
          label: "Republika Turska",
        },
        {
          value: "TUV",
          label: "Tuvalu",
        },
        {
          value: "TWN",
          label: "Republika Kina",
        },
        {
          value: "TZA",
          label: "Ujedinjena Republika Tanzanija",
        },
        {
          value: "UGA",
          label: "Republika Uganda",
        },
        {
          value: "UKR",
          label: "Ukrajina",
        },
        {
          value: "UMI",
          label: "Mali udaljeni otoci SAD-a",
        },
        {
          value: "URY",
          label: "Orijentalna Republika Urugvaj",
        },
        {
          value: "USA",
          label: "Sjedinjene Države Amerike",
        },
        {
          value: "UZB",
          label: "Republika Uzbekistan",
        },
        {
          value: "VAT",
          label: "Vatikan",
        },
        {
          value: "VCT",
          label: "Sveti Vincent i Grenadini",
        },
        {
          value: "VEN",
          label: "BOLIVARIJANSKA Republika Venezuela",
        },
        {
          value: "VGB",
          label: "Djevičanski Otoci",
        },
        {
          value: "VIR",
          label: "Djevičanski Otoci SAD",
        },
        {
          value: "VNM",
          label: "Socijalistička Republika Vijetnam",
        },
        {
          value: "VUT",
          label: "Republika Vanuatu",
        },
        {
          value: "WLF",
          label: "Teritoriju Wallis i Futuna",
        },
        {
          value: "WSM",
          label: "Nezavisna Država Samoa",
        },
        {
          value: "YEM",
          label: "Republika Jemen",
        },
        {
          value: "ZAF",
          label: "Južnoafrička Republika",
        },
        {
          value: "ZMB",
          label: "Republika Zambija",
        },
        {
          value: "ZWE",
          label: "Republika Zimbabve",
        },
      ],
    },
    {
      field: "email",
      type: "string",
      headerName: "Email",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "phone",
      type: "string",
      headerName: "Phone",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "mobile",
      type: "string",
      headerName: "Mobile",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "fax",
      type: "string",
      headerName: "Fax",
      availableAggregationFunctions: ["size"],
    },
    {
      field: "addresses_created_at",
      type: "dateTime",
      headerName: "Address Created At",
      availableAggregationFunctions: ["min", "max", "size"],
    },
    {
      field: "addresses_updated_at",
      type: "dateTime",
      headerName: "Address Updated At",
      availableAggregationFunctions: ["min", "max", "size"],
    },
    {
      field: "addresses_deleted_at",
      type: "dateTime",
      headerName: "Address Deleted At",
      availableAggregationFunctions: ["min", "max", "size"],
    },
    {
      field: "actions",
      type: "actions",
      headerName: "actions",
      aggregable: false,
      description: "Actions column",
      filterable: false,
      groupable: false,
      sortable: false,
    },
  ],
};

const rows = generateRows(40);

export const mockData: IGridDataResponse = {
  selectedRows: [],
  rows: rows,
  totalRows: 3,
  hasNextPage: false,
};
