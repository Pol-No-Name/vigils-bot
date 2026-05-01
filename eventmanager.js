const { DateTime } = require("luxon");

const timezone = "Europe/London";

// --- EVENT TABLES ---
const worldevent_carnival = {
    role: "1499841415205621853",
    events: [
        { hour: 6, minute: 0, name: "Carnival of Hearts" },
        { hour: 7, minute: 30, name: "Carnival of Hearts" },
        { hour: 9, minute: 0, name: "Carnival of Hearts" },
        { hour: 10, minute: 30, name: "Carnival of Hearts" },
        { hour: 12, minute: 0, name: "Carnival of Hearts" },
        { hour: 13, minute: 30, name: "Carnival of Hearts" },
        { hour: 15, minute: 0, name: "Carnival of Hearts" },
        { hour: 16, minute: 30, name: "Carnival of Hearts" },
        { hour: 18, minute: 0, name: "Carnival of Hearts" },
        { hour: 19, minute: 30, name: "Carnival of Hearts" },
        { hour: 21, minute: 0, name: "Carnival of Hearts" },
        { hour: 22, minute: 30, name: "Carnival of Hearts" },
        { hour: 0, minute: 0, name: "Carnival of Hearts" },
        { hour: 1, minute: 30, name: "Carnival of Hearts" },
        { hour: 3, minute: 0, name: "Carnival of Hearts" },
        { hour: 4, minute: 30, name: "Carnival of Hearts" }
    ]
};

const worldevent_parasol = {
    role: "1499841466963595284",
    events: [
    { hour: 6, minute: 30, name: "Interluminary Parasol" },
    { hour: 8, minute: 0, name: "Interluminary Parasol" },
    { hour: 9, minute: 30, name: "Interluminary Parasol" },
    { hour: 11, minute: 0, name: "Interluminary Parasol" },
    { hour: 12, minute: 30, name: "Interluminary Parasol" },
    { hour: 14, minute: 0, name: "Interluminary Parasol" },
    { hour: 15, minute: 30, name: "Interluminary Parasol" },
    { hour: 17, minute: 0, name: "Interluminary Parasol" },
    { hour: 18, minute: 30, name: "Interluminary Parasol" },
    { hour: 20, minute: 0, name: "Interluminary Parasol" },
    { hour: 21, minute: 30, name: "Interluminary Parasol" },
    { hour: 23, minute: 0, name: "Interluminary Parasol" },
    { hour: 0, minute: 30, name: "Interluminary Parasol" },
    { hour: 2, minute: 0, name: "Interluminary Parasol" },
    { hour: 3, minute: 30, name: "Interluminary Parasol" },
    { hour: 5, minute: 0, name: "Interluminary Parasol" }
    ]
};

const worldevent_battleroyale = {
    role: "1499841449674412153",
    events: [
    { hour: 7, minute: 0, name: "Battle Royale" },
    { hour: 8, minute: 30, name: "Battle Royale" },
    { hour: 10, minute: 0, name: "Battle Royale" },
    { hour: 11, minute: 30, name: "Battle Royale" },
    { hour: 13, minute: 0, name: "Battle Royale" },
    { hour: 14, minute: 30, name: "Battle Royale" },
    { hour: 16, minute: 0, name: "Battle Royale" },
    { hour: 17, minute: 30, name: "Battle Royale" },
    { hour: 19, minute: 0, name: "Battle Royale" },
    { hour: 20, minute: 30, name: "Battle Royale" },
    { hour: 22, minute: 0, name: "Battle Royale" },
    { hour: 23, minute: 30, name: "Battle Royale" },
    { hour: 1, minute: 0, name: "Battle Royale" },
    { hour: 2, minute: 30, name: "Battle Royale" },
    { hour: 4, minute: 0, name: "Battle Royale" },
    { hour: 5, minute: 30, name: "Battle Royale" }
    ]
};


function getAllEvents() {
    return [
        ...worldevent_carnival.events.map(e => ({ ...e, role: worldevent_carnival.role })),
        ...worldevent_parasol.events.map(e => ({ ...e, role: worldevent_parasol.role })),
        ...worldevent_battleroyale.events.map(e => ({ ...e, role: worldevent_battleroyale.role }))
    ];
}

// --- CORE: GET NEXT GLOBAL EVENT ---
function getNextEvent() {
    const now = DateTime.now().setZone(timezone);

    const next = getAllEvents().map(event => {
        let eventTime = DateTime.fromObject(
            { hour: event.hour, minute: event.minute },
            { zone: timezone }
        );

        // move to next day if already passed
        if (eventTime <= now) {
            eventTime = eventTime.plus({ days: 1 });
        }

        return {
            name: event.name,
            hour: event.hour,
            minute: event.minute,
            time: eventTime,
            role: event.role
        };
    });

    return next.reduce((a, b) => (a.time < b.time ? a : b));
}

// --- OPTIONAL HELPERS (kept for compatibility) ---
function getNextByName(name) {
    const filtered = getAllEvents().filter(e => e.name === name);
    const now = DateTime.now().setZone(timezone);

    const next = filtered.map(event => {
        let eventTime = DateTime.fromObject(
            { hour: event.hour, minute: event.minute },
            { zone: timezone }
        );

        if (eventTime <= now) {
            eventTime = eventTime.plus({ days: 1 });
        }

        return { ...event, time: eventTime };
    });

    return next.reduce((a, b) => (a.time < b.time ? a : b));
}

// --- EXPORTS ---
module.exports = {
    getNextEvent,
    getNextCarnival: () => getNextByName("Carnival of Hearts"),
    getNextParasol: () => getNextByName("Interluminary Parasol"),
    getNextBattleRoyale: () => getNextByName("Battle Royale")
};