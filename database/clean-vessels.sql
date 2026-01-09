-- Clean up vessels with broken image URLs
DELETE FROM candle_vessels;

-- Reset the SKU sequence if needed
-- The generate_next_sku() function will start fresh at LL-100
