const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const collaboratorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    permission: {
        type: String,
        enum: ['view', 'edit'],
        default: 'view',
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
});

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        content: {
            type: String,
            default: '',
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        collaborators: [collaboratorSchema],
        tags: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],
        isPinned: {
            type: Boolean,
            default: false,
        },
        color: {
            type: String,
            default: '#ffffff',
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
        lastEditedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

// Text index for full-text search
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Paginate plugin
noteSchema.plugin(mongoosePaginate);

// Soft delete method
noteSchema.methods.softDelete = async function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
};

module.exports = mongoose.model('Note', noteSchema);
