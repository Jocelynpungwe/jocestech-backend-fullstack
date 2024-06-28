const mongoose = require('mongoose')

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide product name'],
      maxlength: [100, 'Name can not be more than 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [1000, 'Description can not be more than 1000 characters'],
    },
    image: {
      type: [String],
      default: ['/uploads/no-product-image.jpeg'],
      required: [true, 'Please provide product image'],
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      enum: [
        'phones',
        'laptops',
        'game consoles',
        'headphones',
        'computers',
        'speakers',
      ],
    },
    company: {
      type: String,
      required: [true, 'Please provide company'],
      enum: {
        values: ['apple', 'dell', 'hp', 'sony', 'microsoft'],
        message: '{VALUE} is not supported',
      },
    },
    colors: {
      type: [String],
      default: ['#0000'],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    features: {
      type: String,
      default:
        'Computers, game consoles, headphones, laptops, speakers, and phones share several common features that enhance functionality and connectivity. These include various connectivity options like Bluetooth, Wi-Fi, USB ports, and 3.5mm audio jacks. They all possess audio capabilities such as built-in speakers and microphones, and processing power through CPUs, GPUs, and RAM for multitasking and performance. Display and graphics support, user interfaces with operating systems, and touch controls are prevalent. Portability is ensured with battery power and lightweight designs. Internal and expandable storage, smart features like voice assistants, and app ecosystems enhance user experience. Network capabilities for internet access and streaming, along with inter-device synchronization and peripheral support, further integrate these devices into a cohesive technological ecosystem.',
      required: [true, 'Please provide product features'],
      maxlength: [1000, 'features can not be more than 1000 characters'],
    },
    box: {
      type: [String],
      default: [
        '1x Device Unit',
        '1x User Manual',
        '1x Documenation Warranty',
        '1x USB Cable',
        '1x Travel Bag',
      ],
      required: true,
    },
    groupRating: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
})

ProductSchema.pre('deleteOne', async function () {
  const productId = this.getQuery()['_id']
  await mongoose.model('Review').deleteMany({ product: productId })
})

module.exports = new mongoose.model('Product', ProductSchema)
