type Row = {
  rowId: number;
  isOdd: boolean;
  isExpanded: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  data: any;
};

const firstNames = [
  "Mirnes",
  "Adnan",
  "Emir",
  "Jasmin",
  "Selma",
  "Amar",
  "Lejla",
  "Tarik",
  "Nermin",
  "Amina",
  "Haris",
  "Denis",
  "Maja",
  "Alen",
  "Emina",
  "Faruk",
  "Sabina",
  "Kenan",
  "Nina",
  "Damir",
  "Irma",
];

const lastNames = [
  "Zahirović",
  "Hodžić",
  "Kovačević",
  "Alić",
  "Mehić",
  "Softić",
  "Hadžić",
  "Bešić",
  "Šabić",
  "Dedić",
  "Karić",
  "Zukić",
  "Perić",
  "Kurtović",
  "Smajić",
  "Osmanović",
  "Begić",
  "Husić",
  "Marić",
  "Ćosić",
  "Zlatić",
];

const statuses = [
  { value: "draft", label: "Draft" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRows(count: number, startId = 1): Row[] {
  const rows: Row[] = [];

  for (let i = 0; i < count; i++) {
    const id = startId + i;

    const firstName = getRandom(firstNames);
    const lastName = getRandom(lastNames);
    const status = getRandom(statuses);

    const isProject = Math.random() > 0.7;

    const documentType = isProject
      ? { value: "project", label: "Project" }
      : { value: "order", label: "Order" };

    const documentNumber = isProject
      ? `H26${String(id).padStart(5, "0")}`
      : `70${String(id).padStart(4, "0")}`;

    // parent logic (simple tree)
    let parent_id: string | null = null;
    if (!isProject && rows.length > 0 && Math.random() > 0.5) {
      const parent = rows[Math.floor(Math.random() * rows.length)];
      parent_id = String(parent.rowId);
    }

    rows.push({
      rowId: id,
      isOdd: id % 2 !== 0,
      isExpanded: false,
      isSelectable: true,
      isSelected: false,
      data: {
        __check__: String(id),
        document_type: documentType,
        document_number: documentNumber,
        customer_number: `BK${String(id).padStart(4, "0")}`,
        business_partner: {
          id: id + 100,
          first_name: firstName,
          last_name: lastName,
          country: "BIH",
        },
        status,
        first_name: firstName,
        last_name: lastName,
        country: {
          value: "BIH",
          label: "Bosna i Hercegovina",
        },
        phone: `+3876${Math.floor(1000000 + Math.random() * 9000000)}`,
        actions: String(id),
        parent_id,
      },
    });
  }

  return rows;
}
