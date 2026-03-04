// Room Controller
// TODO: เชื่อมต่อกับฐานข้อมูลจริง

export const getAllRooms = async (req, res) => {
    try {
        // TODO: ดึงข้อมูลจาก DB
        res.json({ message: 'GET all rooms - TODO' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getRoomByNumber = async (req, res) => {
    try {
        const { roomNumber } = req.params;
        // TODO: ดึงข้อมูลจาก DB
        res.json({ message: `GET room ${roomNumber} - TODO` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createRoom = async (req, res) => {
    try {
        const roomData = req.body;
        // TODO: บันทึกลง DB
        res.status(201).json({ message: 'Room created - TODO', data: roomData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRoom = async (req, res) => {
    try {
        const { roomNumber } = req.params;
        const updates = req.body;
        // TODO: อัพเดตใน DB
        res.json({ message: `Room ${roomNumber} updated - TODO`, data: updates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const { roomNumber } = req.params;
        // TODO: ลบจาก DB
        res.json({ message: `Room ${roomNumber} deleted - TODO` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateMeters = async (req, res) => {
    try {
        const { roomNumber } = req.params;
        const { waterMeter, electricMeter } = req.body;
        // TODO: อัพเดตมิเตอร์ใน DB
        res.json({ message: `Meters updated for room ${roomNumber} - TODO` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
