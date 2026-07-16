let io;

module.exports = {

    init: (Socketio) => {
        io = Socketio;
        io.on("connection", (socket) => {
            console.log("Connected:", socket.id);
            socket.on("register", (profileid) => {
                socket.join(profileid);
                console.log("Joined profile:", profileid);
            });
            socket.on("joingroup", (groupid) => {
                socket.join(groupid);
                console.log("Joined group:", groupid);
            });
            socket.on("disconnect", () => {
                console.log("Disconnected:", socket.id);
            });
        });
    },
    getIO: () => io
};