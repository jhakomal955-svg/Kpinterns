/**
 * Counter Model
 * Atomic sequence counter for certificates, offer letters, and global registries
 */

const CounterModel = {
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
};

export default CounterModel;
