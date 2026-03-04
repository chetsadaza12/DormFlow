// Bill Controller
// TODO: เชื่อมต่อกับฐานข้อมูลจริง

export const getAllBills = async (req, res) => {
    try {
        const { room } = req.query;
        // TODO: ดึงจาก DB (filter by room if provided)
        res.json({ message: 'GET all bills - TODO', filter: { room } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBillById = async (req, res) => {
    try {
        const { id } = req.params;
        // TODO: ดึงจาก DB
        res.json({ message: `GET bill ${id} - TODO` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createBill = async (req, res) => {
    try {
        const billData = req.body;
        // TODO: บันทึกลง DB
        res.status(201).json({ message: 'Bill created - TODO', data: billData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateBill = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // TODO: อัพเดตใน DB
        res.json({ message: `Bill ${id} updated - TODO`, data: updates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteBill = async (req, res) => {
    try {
        const { id } = req.params;
        // TODO: ลบจาก DB
        res.json({ message: `Bill ${id} deleted - TODO` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        // TODO: คำนวณสถิติจาก DB
        res.json({ message: 'Dashboard stats - TODO' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
