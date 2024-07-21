const Hapi = require ("@hapi/hapi");
const notes = require ("./api/notes");
const NotesService = require ("./service/inMemory/NotesService");
const NotesValidator = require ("./validator/notes");
const ClientError = require("./exeptions/ClientError");

const init = async () => {
    const notesService = new NotesService();
    const server = Hapi.server({
        port: 5005,
        host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register ({
        plugin: notes,
        options: {
            service: notesService,
            validator: NotesValidator,
        },
    });

    server.ext('onPreResponse', (request, h) => {

        // mendapatkan konteks response dari request
        const { response } = request;

        if (response instanceof ClientError) {
            const newResponse = h.response ({
                status: 'fail',
                message: response.message,
            });

            newResponse.code(response.statusCode);
            return newResponse;
        };

        return h.continue;
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();