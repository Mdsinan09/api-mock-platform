export const SAMPLE_SCHEMAS = [
  {
    id: 'petstore',
    name: 'Swagger Petstore API',
    description: 'Classic PetStore OpenAPI spec with pets, store orders, and user endpoints.',
    badge: 'Popular',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    spec: {
      openapi: '3.0.0',
      info: {
        title: 'Swagger Petstore API',
        version: '1.0.5',
        description: 'A sample pet store server providing pet management, ordering, and user authentication.'
      },
      paths: {
        '/pets': {
          get: {
            summary: 'List all pets',
            operationId: 'listPets',
            parameters: [
              { name: 'limit', in: 'query', description: 'How many items to return', required: false, schema: { type: 'integer' } }
            ],
            responses: {
              '200': {
                description: 'A paged array of pets',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer', example: 101 },
                          name: { type: 'string', example: 'Doggie' },
                          tag: { type: 'string', example: 'golden-retriever' },
                          status: { type: 'string', example: 'available' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Create a pet',
            operationId: 'createPet',
            responses: {
              '201': {
                description: 'Null response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 102 },
                        name: { type: 'string', example: 'Max' },
                        status: { type: 'string', example: 'pending' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/pets/{petId}': {
          get: {
            summary: 'Info for a specific pet',
            operationId: 'showPetById',
            responses: {
              '200': {
                description: 'Expected response to a valid request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 42 },
                        name: { type: 'string', example: 'Buddy' },
                        tag: { type: 'string', example: 'beagle' },
                        status: { type: 'string', example: 'available' }
                      }
                    }
                  }
                }
              }
            }
          },
          delete: {
            summary: 'Delete a pet by ID',
            operationId: 'deletePet',
            responses: {
              '200': {
                description: 'Pet deleted successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Pet #42 deleted successfully' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  {
    id: 'ecommerce',
    name: 'NeoCommerce Store API',
    description: 'E-commerce platform API for products, shopping cart, reviews, and checkout.',
    badge: 'Featured',
    color: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
    spec: {
      openapi: '3.0.0',
      info: {
        title: 'NeoCommerce Store API',
        version: '2.1.0',
        description: 'Modern storefront API supporting multi-currency pricing, inventory check, and orders.'
      },
      paths: {
        '/products': {
          get: {
            summary: 'Search & filter products',
            operationId: 'getProducts',
            responses: {
              '200': {
                description: 'Product catalog list',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'prod_9921' },
                          title: { type: 'string', example: 'Noise-Canceling Wireless Headphones' },
                          price: { type: 'number', example: 299.99 },
                          currency: { type: 'string', example: 'USD' },
                          rating: { type: 'number', example: 4.8 },
                          inStock: { type: 'boolean', example: true }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/cart/checkout': {
          post: {
            summary: 'Process cart checkout',
            operationId: 'checkoutCart',
            responses: {
              '200': {
                description: 'Checkout invoice created',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        orderId: { type: 'string', example: 'ord_88192' },
                        totalAmount: { type: 'number', example: 324.50 },
                        paymentStatus: { type: 'string', example: 'completed' },
                        estimatedDelivery: { type: 'string', example: '2026-07-28' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  {
    id: 'auth',
    name: 'Auth & IAM Service',
    description: 'OAuth2 / JWT Authentication, user profiles, MFA, and permission checks.',
    badge: 'Security',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
    spec: {
      openapi: '3.0.0',
      info: {
        title: 'Auth & IAM Service API',
        version: '1.2.0',
        description: 'Identity management endpoints for authentication, JWT refresh tokens, and user profile.'
      },
      paths: {
        '/auth/login': {
          post: {
            summary: 'Authenticate user & issue tokens',
            operationId: 'loginUser',
            responses: {
              '200': {
                description: 'JWT Auth token payload',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        tokenType: { type: 'string', example: 'Bearer' },
                        expiresIn: { type: 'integer', example: 3600 },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: 'usr_771' },
                            email: { type: 'string', example: 'alex@example.com' },
                            role: { type: 'string', example: 'ADMIN' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/users/me': {
          get: {
            summary: 'Get current user profile',
            operationId: 'getCurrentUser',
            responses: {
              '200': {
                description: 'User details',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'usr_771' },
                        name: { type: 'string', example: 'Alex Morgan' },
                        avatarUrl: { type: 'string', example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },
                        verified: { type: 'boolean', example: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  {
    id: 'payments',
    name: 'PayPulse Gateway API',
    description: 'Payment intents, webhook triggers, subscriptions, and refund processing.',
    badge: 'Finance',
    color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-600 dark:text-sky-400',
    spec: {
      openapi: '3.0.0',
      info: {
        title: 'PayPulse Gateway API',
        version: '3.0.0',
        description: 'Global payments gateway for subscriptions, one-time charges, and webhook notifications.'
      },
      paths: {
        '/v1/payment-intents': {
          post: {
            summary: 'Create payment intent',
            operationId: 'createPaymentIntent',
            responses: {
              '200': {
                description: 'Payment intent payload',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'pi_3MtwB2LkdIwR' },
                        amount: { type: 'integer', example: 5000 },
                        currency: { type: 'string', example: 'usd' },
                        clientSecret: { type: 'string', example: 'pi_3MtwB2LkdIwR_secret_9982' },
                        status: { type: 'string', example: 'requires_payment_method' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/v1/subscriptions': {
          get: {
            summary: 'List active subscriptions',
            operationId: 'listSubscriptions',
            responses: {
              '200': {
                description: 'Subscriptions array',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'sub_109283' },
                          plan: { type: 'string', example: 'Pro Unlimited Annual' },
                          status: { type: 'string', example: 'active' },
                          currentPeriodEnd: { type: 'string', example: '2027-01-01T00:00:00Z' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
];
