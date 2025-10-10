-- Agregar campos de envío a la tabla orders
-- Ejecutar este script en tu consola de Supabase

-- Agregar columnas de información de envío
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS shipping_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_document_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS shipping_document_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_department VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS shipping_neighborhood VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_additional_info TEXT,
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0;

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_orders_shipping_city ON orders(shipping_city);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_department ON orders(shipping_department);

-- Comentarios
COMMENT ON COLUMN orders.shipping_full_name IS 'Nombre completo de quien recibe';
COMMENT ON COLUMN orders.shipping_phone IS 'Teléfono de contacto para envío';
COMMENT ON COLUMN orders.shipping_email IS 'Email de contacto para envío';
COMMENT ON COLUMN orders.shipping_document_type IS 'Tipo de documento: cc, ce, nit, passport';
COMMENT ON COLUMN orders.shipping_document_number IS 'Número de documento';
COMMENT ON COLUMN orders.shipping_address IS 'Dirección completa de envío';
COMMENT ON COLUMN orders.shipping_city IS 'Ciudad de envío';
COMMENT ON COLUMN orders.shipping_department IS 'Departamento/Estado de envío';
COMMENT ON COLUMN orders.shipping_postal_code IS 'Código postal';
COMMENT ON COLUMN orders.shipping_neighborhood IS 'Barrio o sector';
COMMENT ON COLUMN orders.shipping_additional_info IS 'Información adicional para el envío (referencias, etc.)';
COMMENT ON COLUMN orders.shipping_cost IS 'Costo del envío';

